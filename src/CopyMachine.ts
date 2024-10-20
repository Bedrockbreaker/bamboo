import { createReadStream, createWriteStream } from "fs";
import { copyFile, lstat, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { Transform } from "stream";

export interface Stamps {
	[key: string]: string
}

export type Filter = string[] | RegExp

export interface CopyOptions {
	fileInclude?: Filter,
	fileExclude?: Filter,
	doStamping?: boolean,
	stampInclude?: Filter,
	stampExclude?: Filter,
	stamps?: Stamps
}

const defaultStamps: Stamps = {
	COPYRIGHT_YEAR: new Date().getFullYear().toString()
};

export async function copyDirectory(
	source: string,
	target: string,
	options: CopyOptions = {}
) {
	await mkdir(target, { recursive: true });

	const files = await readdir(source);

	const promises: Promise<unknown>[] = [];

	for (const file of files) {
		const sourceFile = join(source, file);
		const targetFile = join(target, file);

		if (
			!match(sourceFile, options.fileInclude)
			|| match(sourceFile, {
				fileExclude: [".gitkeep"], ...options
			}.fileExclude)
		) {
			continue;
		}

		if ((await lstat(sourceFile)).isDirectory()) {
			promises.push(copyDirectory(sourceFile, targetFile, options));
			continue;
		}

		let stampFile = (options.doStamping ?? true)
			&& match(sourceFile, options.stampInclude)
			&& !match(sourceFile, options.stampExclude ?? []);

		if (stampFile) {
			promises.push(stamp(
				sourceFile,
				targetFile,
				{ ...defaultStamps, ...options.stamps }
			));
		} else {
			promises.push(copyFile(sourceFile, targetFile));
		}
	}

	await Promise.all(promises);
}

export function stamp(source: string, destination: string, stamps: Stamps) {
	return new Promise((resolve, reject) => {
		const readStream = createReadStream(source);
		const writeStream = createWriteStream(destination);
		
		const transformStream = new Transform({
			transform(chunk, _, callback) {
				let chunkString: string = chunk.toString();

				chunkString = chunkString.replace(
					/\{\{([A-Z_]*?)\}\}/g,
					(_, key: string) => {
						return stamps[key.trim()] || `{{${key}}}`;
					}
				);

				callback(null, Buffer.from(chunkString, "utf8"));
			}
		});

		readStream.pipe(transformStream).pipe(writeStream);

		writeStream.on("finish", resolve);
		writeStream.on("error", reject);
	});
}

export function match(source: string, filter?: Filter) {
	return !filter || (
		Array.isArray(filter)
		&& filter.some(String.prototype.includes.bind(source))
	) || (
		filter instanceof RegExp
		&& source.match(filter)
	);
}
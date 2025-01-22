import { program } from "@commander-js/extra-typings";
import { join } from "path";
import prompts from "prompts";

import { copyDirectory } from "./CopyMachine.js";

const templateDirectory = join(import.meta.dirname, "../template/cpp");

async function scaffold(name: string) {
	const targetDirectory = join(process.cwd(), name);

	await copyDirectory(templateDirectory, targetDirectory, {
		stampInclude: ["LICENSE", "CMakeLists.txt", "launch.json"],
		stamps: {
			PROJECT_NAME: name
		}
	});
}

program
	.command("cpp")
	.description("Scaffolds a C++23 project that uses CMake, Ninja, and gcc.")
	.option("-n, --name <name>", "Project name")
	.action(async ({name}) => {

		name ??= (await prompts({
			type: "text",
			name: "projectName",
			message: "Enter project name",
			validate: (name) => name ? true : "Project name is required"
		})).projectName;

		if (name === undefined || name === "") {
			program.error("Project name is required");
		}

		return await scaffold(name);
	});
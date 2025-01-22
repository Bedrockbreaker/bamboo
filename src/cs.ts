import { execSync } from "child_process";
import { program } from "@commander-js/extra-typings";
import { join } from "path";
import prompts from "prompts";

import { copyDirectory } from "./CopyMachine.js";

const templateDirectory = join(import.meta.dirname, "../template/c#");

async function scaffold(name: string, template: string, dotnetOptions: Record<string, string> = {}) {
	const targetDirectory = join(process.cwd(), name);

	await copyDirectory(templateDirectory, targetDirectory, {
		stampInclude: ["LICENSE"]
	});

	execSync(`dotnet new ${template} -o ${targetDirectory} ${Object.entries(dotnetOptions).map(([key, value]) => `${key} ${value}`).join(" ")}`);
}

program
	.command("c#")
	.alias("cs")
	.description("Scaffolds a C# project. Requires dotnet to be installed.")
	.option("-n, --name <name>", "Project name")
	.option("-t, --template <template>", "Dotnet template", "console")
	.allowUnknownOption()
	.action(async ({name, template, ...dotnetOptions}) => {

		name ??= (await prompts({
			type: "text",
			name: "projectName",
			message: "Enter project name",
			validate: (name) => name ? true : "Project name is required"
		})).projectName;

		if (name === undefined || name === "") {
			program.error("Project name is required");
		}

		return await scaffold(name, template, dotnetOptions);
	});
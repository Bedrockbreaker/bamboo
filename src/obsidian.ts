import { program } from "@commander-js/extra-typings";
import { join } from "path";
import prompts from "prompts";

import { copyDirectory } from "./CopyMachine.js";

const templateDirectory = join(import.meta.dirname, "../template/obsidian");

async function scaffold(name: string, nickname: string) {
	const targetDirectory = join(process.cwd(), name);

	await copyDirectory(templateDirectory, targetDirectory, {
		stampInclude: [".vault-nickname"],
		stamps: {
			PROJECT_NAME: name,
			VAULT_NICKNAME: nickname
		}
	});
}

program
	.command("obsidian")
	.description("Scaffolds an Obsidan vault with git, LanguageTool, and Templater.")
	.option("-n, --name <name>", "Project name")
	.option("-r, --nickname <nickname>", "Nickname for vault")
	.action(async ({name, nickname}) => {

		name ??= (await prompts({
			type: "text",
			name: "projectName",
			message: "Enter project name",
			validate: (name) => name ? true : "Project name is required"
		})).projectName;

		if (name === undefined || name === "") {
			program.error("Project name is required");
		}

		return await scaffold(name, nickname ?? "");
	});
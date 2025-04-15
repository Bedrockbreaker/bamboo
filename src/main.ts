#!/usr/bin/env -S node --no-warnings

import { program } from "@commander-js/extra-typings";

import "./cpp.js";
import "./cs.js";
import "./obsidian.js";

import packageJson from "../package.json" with { type: "json" };

program
	.name(packageJson.name)
	.description(packageJson.description)
	.version(packageJson.version);

program.parse();
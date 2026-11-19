import assert from "node:assert/strict";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerSessionRename } from "./rename.js";

const prefix = "mesh @agent-1 · room-one,room.two";
const oldTitle = `${prefix} — First message`;

async function rename(current: string, args: string, input?: string) {
	const saved: string[] = [];
	let placeholder: string | undefined;
	let run: Parameters<ExtensionAPI["registerCommand"]>[1]["handler"] | undefined;
	await registerSessionRename({
		registerCommand: (_name, command) => { run = command.handler; },
		getSessionName: () => current,
		setSessionName: (title) => { saved.push(title); },
		appendEntry: () => {},
		sendMessage: () => {},
	} as Pick<ExtensionAPI, "registerCommand" | "getSessionName" | "setSessionName" | "appendEntry" | "sendMessage"> as ExtensionAPI);
	assert.ok(run);
	await run(args, {
		isIdle: () => true,
		ui: {
			input: async (_label: string, value?: string) => {
				placeholder = value;
				return input;
			},
		},
	} as Parameters<typeof run>[1]);
	return { saved, placeholder };
}

assert.deepEqual((await rename(oldTitle, "Naming cleanup — follow-up")).saved, [`${prefix} — Naming cleanup — follow-up`]);
assert.deepEqual((await rename(prefix, "Naming cleanup")).saved, [`${prefix} — Naming cleanup`]);
assert.deepEqual((await rename("mesh @agent-1", "Naming cleanup")).saved, ["mesh @agent-1 — Naming cleanup"]);
assert.deepEqual((await rename(oldTitle, `${prefix} — Naming cleanup`)).saved, [`${prefix} — Naming cleanup`]);
assert.deepEqual(await rename(oldTitle, "", "Naming cleanup"), {
	saved: [`${prefix} — Naming cleanup`], placeholder: "First message",
});
assert.deepEqual((await rename(oldTitle, "", "")).saved, []);
assert.deepEqual((await rename(oldTitle, "")).saved, []);
assert.deepEqual((await rename("Previous title", "Plain title")).saved, ["Plain title"]);
assert.deepEqual((await rename("mesh @agent-1 about networks", "Plain title")).saved, ["Plain title"]);
assert.deepEqual((await rename("Previous title", "", "")).saved, [""]);

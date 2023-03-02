import { execSync } from "child_process";
import * as os from "os";
import {
	commands,
	Disposable,
	ExtensionContext,
	window,
	workspace,
} from "vscode";

export function deactivate() {}

export function activate(context: ExtensionContext) {
	let nemacs = new Nemacs();
	context.subscriptions.push(
		commands.registerCommand("nemacs.mark", () => {
			nemacs.mark();
		}),
	);
	for (let cmd of [
		"cursorUp",
		"cursorDown",
		"cursorLeft",
		"cursorRight",
		"cursorHome",
		"cursorEnd",
		"cursorPageUp",
		"cursorPageDown",
	]) {
		context.subscriptions.push(
			commands.registerCommand(`nemacs.${cmd}`, () => {
				nemacs.cursorMove(cmd);
			}),
		);
	}
	context.subscriptions.push(
		commands.registerCommand("nemacs.killLine", () => {
			nemacs.killLine();
		}),
	);
	context.subscriptions.push(
		commands.registerCommand("nemacs.yank", () => {
			nemacs.yank();
		}),
	);
	context.subscriptions.push(
		commands.registerCommand("nemacs.copy", () => {
			nemacs.copy();
		}),
	);
	context.subscriptions.push(
		commands.registerCommand("nemacs.centerVertically", () => {
			nemacs.centerVertically();
		}),
	);
	context.subscriptions.push(
		commands.registerCommand("nemacs.deleteWordRight", () => {
			nemacs.deleteWordRight();
		}),
	);
	context.subscriptions.push(
		commands.registerCommand("nemacs.cancelSelection", () => {
			nemacs.cancelSelection();
		}),
	);

	context.subscriptions.push(nemacs);
}

class Nemacs {
	private disposable: Disposable;
	private marked: boolean = false;
	private moving: boolean = false;
	private ringBuffer: string = "";

	constructor() {
		let subscriptions: Disposable[] = [];
		window.onDidChangeTextEditorSelection(
			this.onDidChangeTextEditorSelection,
			this,
			subscriptions,
		);
		this.disposable = Disposable.from(...subscriptions);
	}

	public mark() {
		this.marked = true;
	}

	public async cursorMove(command: string) {
		if (this.marked) {
			this.moving = true;
			await commands.executeCommand(`${command}Select`);
			this.moving = false;
		} else {
			await commands.executeCommand(command);
		}
		if (["cursorPageUp", "cursorPageDown"].includes(command)) {
			this.centerVertically();
		}
	}

	private copyRingBuffer() {
		if (this.ringBuffer) {
			if (os.platform() === "darwin") {
				execSync("pbcopy", { input: this.ringBuffer });
			}
			this.ringBuffer = "";
		}
	}

	private onDidChangeTextEditorSelection() {
		if (this.marked && !this.moving) {
			this.cancelSelection();
		}
		this.copyRingBuffer();
	}

	public cancelSelection() {
		this.marked = false;
		this.moving = false;
		commands.executeCommand("cancelSelection");
	}

	public killLine() {
		if (!window.activeTextEditor) return;
		let sel = window.activeTextEditor.selection;
		let line = window.activeTextEditor.document.lineAt(sel.active.line);
		if (this.marked) {
			commands.executeCommand("editor.action.clipboardCutAction");
		} else if (line.range.end.character === sel.active.character) {
			if (line.lineNumber < window.activeTextEditor.document.lineCount - 1) {
				this.ringBuffer =
					this.ringBuffer + workspace.getConfiguration("files").get("eol");
				commands.executeCommand("deleteRight");
			}
		} else {
			this.ringBuffer =
				this.ringBuffer +
				line.text.substring(sel.active.character, line.range.end.character);
			commands.executeCommand("deleteAllRight");
		}
	}

	public yank() {
		this.copyRingBuffer();
		commands.executeCommand("editor.action.clipboardPasteAction");
	}

	public copy() {
		commands.executeCommand("editor.action.clipboardCopyAction");
		this.cancelSelection();
	}

	public centerVertically() {
		if (!window.activeTextEditor) return;
		commands.executeCommand("revealLine", {
			lineNumber: window.activeTextEditor.selection.active.line,
			at: "center",
		});
	}

	public deleteWordRight() {
		commands.executeCommand("cursorWordRightSelect");
		commands.executeCommand("editor.action.clipboardCutAction");
	}

	dispose() {
		this.disposable.dispose();
	}
}

import {commands, window, Disposable, ExtensionContext, Selection, Position} from 'vscode'

export function activate(context: ExtensionContext) {
  let nemacs = new Nemacs()
  context.subscriptions.push(commands.registerCommand('nemacs.mark', () => {
    nemacs.mark()
  }))
  for (let cmd of ['cursorUp', 'cursorDown', 'cursorLeft', 'cursorRight', 'cursorHome', 'cursorEnd']) {
    context.subscriptions.push(commands.registerCommand(`nemacs.${cmd}`, () => {
      nemacs.cursorMove(cmd)
    }))
  }
  context.subscriptions.push(commands.registerCommand('nemacs.killLine', () => {
    nemacs.killLine()
  }))
  context.subscriptions.push(nemacs)
}

class Nemacs {
  private disposable: Disposable
  private marked: boolean = false
  private moving: boolean = false

  constructor() {
    let subscriptions: Disposable[] = []
    window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this, subscriptions)
    this.disposable = Disposable.from(...subscriptions)
  }

  public mark() {
    this.marked = true
  }

  public cursorMove(command) {
    if (this.marked) {
      this.moving = true
      commands.executeCommand(command + 'Select')
      .then(() => {
        this.moving = false
      })
    } else {
      commands.executeCommand(command)
    }
  }

  private onDidChangeTextEditorSelection(e) {
    if (this.marked && !this.moving) {
      this.cancelSelection()
    }
  }

  public cancelSelection() {
    this.marked = false
    this.moving = false
    commands.executeCommand('cancelSelection')
  }

  public killLine() {
    let sel = window.activeTextEditor.selection
    let line = window.activeTextEditor.document.lineAt(sel.active.line)
    if (line.range.end.character == sel.active.character) {
      commands.executeCommand('deleteRight')
    } else {
      commands.executeCommand('deleteAllRight')
    }
  }

  dispose() {
    this.disposable.dispose()
  }
}

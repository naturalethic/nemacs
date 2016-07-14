import {commands, workspace, window, Disposable, ExtensionContext, Selection, Position, TextEditorRevealType} from 'vscode'
import {execSync} from 'child_process'

export function activate(context: ExtensionContext) {
  let nemacs = new Nemacs()
  context.subscriptions.push(commands.registerCommand('nemacs.mark', () => {
    nemacs.mark()
  }))
  for (let cmd of ['cursorUp', 'cursorDown', 'cursorLeft', 'cursorRight', 'cursorHome', 'cursorEnd', 'cursorPageUp', 'cursorPageDown']) {
    context.subscriptions.push(commands.registerCommand(`nemacs.${cmd}`, () => {
      nemacs.cursorMove(cmd)
    }))
  }
  context.subscriptions.push(commands.registerCommand('nemacs.killLine', () => {
    nemacs.killLine()
  }))
  context.subscriptions.push(commands.registerCommand('nemacs.yank', () => {
    nemacs.yank()
  }))
  context.subscriptions.push(commands.registerCommand('nemacs.copy', () => {
    nemacs.copy()
  }))
  context.subscriptions.push(commands.registerCommand('nemacs.centerVertically', () => {
    nemacs.centerVertically()
  }))
  context.subscriptions.push(nemacs)
}

class Nemacs {
  private disposable: Disposable
  private marked: boolean = false
  private moving: boolean = false
  private ringBuffer: string = ''

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

  private copyRingBuffer() {
    if (this.ringBuffer) {
      execSync('pbcopy', {input: this.ringBuffer})
      this.ringBuffer = ''
    }
  }

  private onDidChangeTextEditorSelection(e) {
    if (this.marked && !this.moving) {
      this.cancelSelection()
    }
    this.copyRingBuffer()
  }

  public cancelSelection() {
    this.marked = false
    this.moving = false
    commands.executeCommand('cancelSelection')
  }

  public killLine() {
    let sel = window.activeTextEditor.selection
    let line = window.activeTextEditor.document.lineAt(sel.active.line)
    if (this.marked) {
      commands.executeCommand('editor.action.clipboardCutAction')
    } else if (line.range.end.character == sel.active.character) {
      if (line.lineNumber < window.activeTextEditor.document.lineCount - 1) {
        this.ringBuffer = this.ringBuffer + workspace.getConfiguration('files').get('eol')
        commands.executeCommand('deleteRight')
      }
    } else {
      this.ringBuffer = this.ringBuffer + line.text.substring(sel.active.character, line.range.end.character)
      commands.executeCommand('deleteAllRight')
    }
  }

  public yank() {
    this.copyRingBuffer()
    commands.executeCommand('editor.action.clipboardPasteAction')
  }

  public copy() {
    commands.executeCommand('editor.action.clipboardCopyAction')
    this.cancelSelection()
  }

  public centerVertically() {
    window.activeTextEditor.revealRange(window.activeTextEditor.selection.with(), TextEditorRevealType.InCenter)
  }

  dispose() {
    this.disposable.dispose()
  }
}

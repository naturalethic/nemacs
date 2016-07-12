# nemacs
Minimal emacs keys extension for VSCode on Mac with better mark/region support.

Source: https://github.com/naturalethic/nemacs

Please see `package.json` for a list of keys commands.

## Mac-only rationale
To support ctrl+k/ctrl+y the extension must access the clipboard.  There is currently
no cross-platform method to do this on vscode.  This author uses a Mac, thus the support.

If anyone would like to help port this to other platforms:

### **Contributions are welcome.**

----

Acknowledgements
* Seed key bindings: https://github.com/nana4gonta/emacs-visual-studio-code
* `ctrl+l` support: https://github.com/finalclass/vscode-keyboard-scroll

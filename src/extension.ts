import { generate } from "derw/build/generator";
import { parseWithContext } from "derw/build/parser";
import { contextModuleToModule } from "derw/build/types";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand("extension.format-derw", () => {
        const { activeTextEditor } = vscode.window;

        if (
            activeTextEditor &&
            activeTextEditor.document.languageId === "derw"
        ) {
            const { document } = activeTextEditor;

            const text = document.getText();
            const parsed = parseWithContext(text, "Main");

            if (parsed.errors.length > 0) {
                return;
            }

            const outputDerw = generate("derw", contextModuleToModule(parsed));

            // only write if files are formatted differently
            if (text === outputDerw) return;

            const range = new vscode.Range(
                0,
                0,
                activeTextEditor.document.lineCount,
                0
            );
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, range, outputDerw);
            return vscode.workspace.applyEdit(edit);
        }
    });

    vscode.languages.registerDocumentFormattingEditProvider("derw", {
        provideDocumentFormattingEdits(
            document: vscode.TextDocument
        ): vscode.TextEdit[] {
            const text = document.getText();
            const parsed = parseWithContext(text, "Main");

            if (parsed.errors.length > 0) {
                return;
            }

            const outputDerw = generate("derw", contextModuleToModule(parsed));

            // only write if files are formatted differently
            if (text === outputDerw) return;

            const range = new vscode.Range(0, 0, document.lineCount, 0);

            return [vscode.TextEdit.replace(range, outputDerw)];
        },
    });
}

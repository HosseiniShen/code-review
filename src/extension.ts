// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, TextEditor } from 'vscode';

import GitService from './extends/git';
import { CodeCommentController } from './extends/comment_controller';
import { triggeReview } from './extends/review';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	const commentController = new CodeCommentController();
	GitService.initGit();

	const command = commands.registerTextEditorCommand('code-review.addCodeReviewComments', async (editor: TextEditor) => {
		triggeReview(editor);
    });
	
	context.subscriptions.push(command);
	context.subscriptions.push(commentController);
}

// this method is called when your extension is deactivated
export function deactivate() {}

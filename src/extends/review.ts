import { TextEditor, window, ProgressLocation } from 'vscode';

import * as Utils from '../utils';
import Comment from './comment';
import GitService from './git';
import { addComment } from '../model/index';

/**
 * 获取review详情
 * @param editor 
 */
export async function getComment (editor: TextEditor): Promise<Comment | undefined> {
    let codeComment: string = '';
    try {
        codeComment = await Utils.getComment();
    } catch {
        return;
    }

    const comment = new Comment();
    const lineRange = Utils.getLineRange(editor);
    comment.setComments = codeComment;
    comment.setStart = lineRange.start;
    comment.setEnd = lineRange.end;
    comment.setFilePath = Utils.getRelativeFilePath(editor);

    try {
        [
            comment.setAppId,
            comment.setProject,
            comment.setCodeContents,
            comment.setBranch,
            comment.setCoder,
            comment.setReviewer
        ] = await Promise.all([
            Utils.getAppId(),
            Utils.getProjectName(),
            Utils.getSelectedText(editor),
            GitService.getCurrentBranch(),
            GitService.getCodeAuthor(comment.getStart, comment.getEnd, comment.getFilePath),
            GitService.getUser()
        ]);
    } catch (error) {
        Utils.warn(error);
        return;
    }

    
    return comment;
}

/**
 * add review
 * @param editor 
 */
export async function triggeReview (editor: TextEditor) {
    const comment: Comment | undefined = await getComment(editor);
    if (!comment) {
        return;
    }

    window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: 'save comment'
        },
        p => {
            return new Promise(async (resolve, reject) => {
                try {
                    p.report({ message: 'saving' });
                    const ret = await addComment(comment);
                    if (ret) {
                        Utils.info('Successfully saved');
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }
    );
}

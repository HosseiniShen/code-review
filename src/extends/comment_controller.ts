import { 
  window,
  StatusBarItem,
  StatusBarAlignment,
  commands,
  Range,
  MarkdownString,
  QuickPickItem,
  workspace,
  Uri,
  Selection,
  Position,
  comments,
  TextDocument,
  CommentController,
  CommentThread
} from 'vscode';
import { getComments } from '../model/index';
import * as Utils from '../utils/index';
import { IRawReviewModel } from '../interfaces';
import * as path from 'path';

/**
 * comment service
 */
export class CodeCommentController {
  private commentBar: StatusBarItem;
  private command: string = 'code-review.getCommentsHistory';
  private commentControl: CommentController;
  private commentsMap: Map<number, IRawReviewModel> = new Map();
  private commentThreadsMap: Map<string, Map<number, CommentThread>> = new Map();

  constructor () {
    this.commentBar = window.createStatusBarItem(StatusBarAlignment.Left);
    this.commentBar.text = 'Comments';
    this.commentBar.color = 'yellow';
    this.commentBar.command = this.command;
    this.commentBar.show();
    commands.registerCommand(this.command, this.getCommentsHistory.bind(this));
    this.commentControl = CommentControl.getSingleInstance();
    this.closeDocHandler();
  }

  /**
   * 获取改项目最新review记录
   */
  async getCommentsHistory () {
    let project = Utils.getProjectName();
    if (!project) {
      return Utils.warn('获取项目名称失败');
    }
    
    let comments = await getComments(project);
    this.commentsMap.clear();
    let pickItems = (comments as IRawReviewModel[]).map(comment => {
      this.commentsMap.set(comment.id, comment);
      return {
        label: `${ comment.id }`,
        description: `the code in ${ comment.file } was reviewed by ${ comment.reviewer } at ${ comment.time }`
      };
    });
    window.showQuickPick(pickItems).then(this.locateDocument.bind(this));
  }

  /**
   * 定位至选择的review文件
   * @param pickItem 
   */
  locateDocument (pickItem: QuickPickItem | undefined) {
    if (!pickItem) {
      return;
    }
    const comment = this.commentsMap.get(~~pickItem.label);
    
    if (!comment) {
      return;
    }
    const filePath = path.resolve(workspace.rootPath || '', comment.file);
    const fileUri = Uri.file(filePath);
    workspace.openTextDocument(fileUri).then(document => {
      let [ startStr, endStr ] = comment.line.split('~');
      const start = ~~startStr - 1;
      const end = ~~endStr - 1;

      const pos = new Position(end, 0);
      window.showTextDocument(document, {
        selection: new Selection(pos, pos)
      }).then(() => {
        this.generateComment(document, fileUri, start, end, comment);
      });
    });

  }

  /**
   * 在目标位置生成 comment 面板
   * @param document 
   * @param fileUri 
   * @param start 
   * @param end 
   * @param comment 
   */
  generateComment (document: TextDocument, fileUri: Uri, start: number, end: number, comment: IRawReviewModel) {
    // todo 去重
    const fileName = document.fileName;
    const commentId = comment.id;
    const threads = this.commentThreadsMap.get(fileName);
    if (threads && threads.has(commentId)) {
      (threads.get(commentId) as CommentThread).collapsibleState = 1;
      return;
    }

    const range = new Range(end, 0, end, 0);
		const commentThread = this.commentControl.createCommentThread(fileUri, range, [
			{
				body: new MarkdownString(
          `* **Coder**：${ comment.coder }\n* **Branch**：${ comment.branch }\n* **FilePath**：${ comment.file }\n* **Lines**：${ comment.line }\n* **Codes**：${ comment.code_fragment }\n* **Comments**：${ comment.comments }\n* **Type**：${ comment.type }\n* **Severity**：${ comment.severity }\n* **BelongTo**：${ comment.trigger_factor }\n* **Time**：${ comment.time }`
        ),
				mode: 1,
				author: { name: comment.reviewer }
			}
    ]);

    commentThread.collapsibleState = 1;

    if (threads) {
      threads.set(commentId, commentThread);
    } else {
      const threadMap = new Map();
      threadMap.set(commentId, commentThread);
      this.commentThreadsMap.set(fileName, threadMap);
    }
   
  }

  /**
   * 在关闭 tab 窗口的时候释放进程资源
   */
  closeDocHandler () {
    // 当文档关闭后释放 thread
    window.onDidChangeVisibleTextEditors((textEditors) => {
      if (textEditors && textEditors.length) {
        textEditors.forEach(textEditor => {
          let threadMap = this.commentThreadsMap.get(textEditor.document.fileName);
          if (threadMap) {
            threadMap.forEach((thread, commentId) =>  thread.dispose() );
          }
        });
      }
		});
  }

  dispose () {
    this.commentBar.dispose();
    this.commentControl.dispose();
  }
}

class CommentControl {
  private static singleInstance: CommentController;

  public static getSingleInstance () {
    return CommentControl.singleInstance || (
      CommentControl.singleInstance = comments.createCommentController('CodeReviewComment', 'CodeReview')
    );
  }
  
}

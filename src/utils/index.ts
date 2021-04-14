import { TextEditor, Selection, workspace, window, InputBoxOptions } from 'vscode';
import { execFile, ExecException, ExecFileOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import { ILineRange } from '../interfaces/index';

/**
 * 获取选中的代码
 * @param editor 
 * @return string
 */
export function getSelectedText (editor: TextEditor): string {
    const selection: Selection = editor.selection;
    return editor.document.getText(selection);
}

/**
 * 获取选中代码行范围
 * @param editor 
 */
export function getLineRange (editor: TextEditor): ILineRange {
    const selection: Selection = editor.selection;
    const start: number = selection.start.line;
    const end: number = selection.end.line;
    return {
        start,
        end
    };
}

/**
 * 获取项目名称
 */
export function getProjectName (): string {
    return workspace.name || '';
}

/**
 * 获取 review 文件的相对路径
 * @param editor 
 */
export function getRelativeFilePath (editor: TextEditor): string {
    let filePath = editor.document.fileName;
    return workspace.asRelativePath(filePath);
}

export function warn (message: string, throwError: boolean = false) {
    if (message) {
        window.showErrorMessage(message);
        if (throwError) {
            throw new Error(message);
        }
    }
}

export function info (message: string) {
    if (message) {
        window.showInformationMessage(message);
    }
}

/**
 * format date
 * @param date 
 * @param format 
 */
export function formateDate (date: Date = new Date(), format: string = 'Y-M-D H:m:s') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const prettify = (target: number) => `0${ target }`.slice(-2);

    return format.replace('Y', `${ year }`)
        .replace('M', prettify(month))
        .replace('D', prettify(day))
        .replace('H', prettify(hour))
        .replace('m', prettify(minute))
        .replace('s', prettify(second));
}

/**
 * shell 执行命令
 * @param command 
 * @param args 
 * @param options 
 */
export function run (
    command: string,
    args: Array<string>,
    options: ExecFileOptions = {}
): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(command, args, options, (error: ExecException | null, stdout: string, stderr: string) => {
            if (error) {
                return reject(error.message);
            }

            if (stderr) {
                warn(stderr);
            }

            resolve(stdout);
        });
    });
}

export async function findGitPath () {
    const platform = process.platform;

    if (platform === 'win32') {
        return await findGitInWindow();
    } else if (platform === 'darwin') {
        return await findGitInDarwin();
    }
}

/**
 * Window Git 
 */
async function findGitInWindow () {
    const envPath = process.env.PATH || '';
    const gitPathFragment = path.join('Git', 'cmd');
    const retEnvPath = envPath.split(';').find(item => item.indexOf(gitPathFragment) > -1);

    if (!retEnvPath) {
        return;
    }
    let gitPath = path.join(retEnvPath, 'git.exe');

    try {
        const stat = fs.statSync(gitPath);
        if (stat && stat.isFile()) {
            return gitPath;
        }
    } catch {}
}

/**
 * MacOSX Git
 */
async function findGitInDarwin () {
    const gitPath = await run('which', [ 'git' ]);

    if (gitPath) {
        return gitPath.trim();
    }
}

/**
 * 从 package 获取 appId
 */
export async function getAppId () {
    const rootPath = workspace.rootPath;
    if (!rootPath) {
        return;
    }

    const packagePath = path.resolve(rootPath, 'package.json');
    try {
        const stat = fs.statSync(packagePath);
        if (stat && stat.isFile()) {
            const contentStr = fs.readFileSync(packagePath, { encoding: 'utf-8' });
            const content = JSON.parse(contentStr);
            const appId = content.appId || content.AppId;
            if (appId) {
                return appId;
            } else {
                throw new Error('Unable to find appId in package.json');
            }
        }
    } catch (error) {
        warn(`Get appId failed: ${error.message}`, true);
    }
    
}

/**
 * 获取code comments
 * @param opts 
 */
export async function getComment (opts: InputBoxOptions = { prompt: `Input your comments` }): Promise<string> {
    return new Promise((resolve, reject) => {
        window.showInputBox(opts).then(comment => {
            comment ? resolve(comment) : reject();
        });
    });
}
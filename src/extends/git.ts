/**
 * git service
 */
import {
    extensions,
    Extension,
    workspace
} from 'vscode';
import { GitExtension } from '../interfaces/git';
import * as Utils from '../utils';
import { ExecFileOptions } from 'child_process';

let GitClient: string | undefined;

export default class GitService {
    /**
     * 获取可执行的 git
     */
    private static async gitClient () {
        if (GitClient) {
            return GitClient;
        }

        GitClient = await GitService.initGit();
        if (!GitClient) {
            Utils.warn('Unable to find git');
        }
        return GitClient;
    }

    /**
     * 初始化 git
     */
    public static async initGit () {
        const extension = extensions.getExtension('vscode.git') as Extension<GitExtension>;

        if (extension !== undefined) {
            const gitExtension = extension.isActive ? extension.exports : await extension.activate();

            const gitApi = gitExtension.getAPI(1);
            return gitApi.git.path;
        }

        return await Utils.findGitPath();
    }

    /**
     * 执行 git 
     * @param args 
     * @param options 
     */
    public static async git (
        args: Array<any>, 
        options: ExecFileOptions = { cwd: workspace.rootPath }
    ) {
        const gitClient = await GitService.gitClient();
        if (!gitClient) {
            return;
        }

        try {
            return Utils.run(gitClient, args, options);
        } catch (error) {
            Utils.warn(error.message);
        }
        
    }

    /**
     * 获取当前分支
     */
    public static async getCurrentBranch () {
        const args = [ 'branch', '--show-current' ];
        const branch = await GitService.git(args);
        if (branch) {
            return branch.trim();
        }
        return '';
    }

    /**
     * 获取 git 用户
     */
    public static async getUser () {
        const args = [ 'config', '--get', 'user.name' ];
        const userName = await GitService.git(args);
        if (userName) {
            return userName.trim();
        }
        return '';
    }

    /**
     * 获取coder
     */
    public static async getCodeAuthor (
        start: number, 
        end: number, 
        filePath: string
    ) {
        const rangeDesc = `-L ${ start },${ end }`;
        const args = ['blame', rangeDesc, filePath, '--root', '--incremental', '-w'];
        const blame = await GitService.git(args);
        if (blame) {
            try {
                const matches = blame.match(/\nauthor\s*(.+)\n/);
                if (matches && matches[1]) {
                    return matches[1];
                }
            } catch {};
        }
        return '';
    }
}
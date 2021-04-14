import * as mysql from 'mysql';
import { IReviewModel, IRawReviewModel } from '../interfaces';
import config from '../utils/config';
import * as Utils from '../utils/index';
import Comment from '../extends/comment';

function execute (sqlString: string, insertRow: any) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(config.mysql);
        connection.query(sqlString, insertRow, (error, results, fields) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
            connection.end();
        }); 
    });
}

/**
 * 添加 code review 记录
 * @param comment 
 */
export async function addComment (comment: Comment) {
    const sqlString = 'INSERT INTO `t_comment` SET ?';
    const date = new Date();
    let ret: any;

    try {
        ret = await execute(sqlString, {
            app_id: comment.getAppId,
            identifier: date.getTime(),
            project: comment.getProject,
            branch: comment.getBranch,
            reviewer: comment.getReviewer,
            coder: comment.getCoder,
            comments: comment.getComments,
            type: comment.getType,
            severity: comment.getSeverity,
            trigger_factor: comment.getBelongTo,
            file: comment.getFilePath,
            line: `${ comment.getStart + 1 } ~ ${ comment.getEnd + 1 }`,
            code_fragment: comment.getCodeContents,
            time: Utils.formateDate(date),
            status: '已处理',
        });
    } catch (error) {
        if (error && error.message) {
            Utils.warn(error.message);
        }
    }

    return ret;
}

/**
 * 获取 code review 记录
 * @param project 
 */
export async function getComments (project: string) {
    const sqlString = 'SELECT * FROM `t_comment` WHERE `project` = ? ORDER BY `identifier` DESC LIMIT 20';

    try {
        let ret = await execute(sqlString, project);
        return ret as IRawReviewModel[];
    } catch (error) {
        if (error && error.message) {
            Utils.warn(error.message);
        }
    }

    return [];
}

export interface ILineRange {
    start: number;
    end: number;
}

export interface IBaseReviewModel {
    project: string;
    filePath: string;
    line: string;
    codeContents: string;
};

export interface IReviewModel extends IBaseReviewModel{
    branch: string;
    reviewer: string;
    coder: string;
    comments: string;
    type: string;
    severity: string;
    belongTo: string;
    appId: string;
};

export const ACTIONS = {
    SAVE: 'save',
    CANCEL: 'cancel',
    ERROR: 'error'
};

export interface IMessage {
    action: keyof typeof ACTIONS;
    data: string;
}

export interface IRawReviewModel {
    id: number;
    app_id: string;
    identifier: number;
    project: string;
    branch: string;
    reviewer: string;
    coder: string;
    comments: string;
    type: string;
    severity: string;
    trigger_factor: string;
    file: string;
    line: string;
    code_fragment: string;
    time: string;
    status: string;
}

export enum TYPES {
    PROBLEM = '问题',
    ADVISE = '建议',
    DOUBT = '疑问'
};

export enum SEVERITY {
    TIPS = '提示',
    COMMONLY = '一般',
    SERIOUS = '严重'
};

export enum BELONGTO {
    CODING_BASIC = '编码基础类',
    CODING_BUSINESS = '业务功能类',
    CODING_SECURITY = '安全可靠类'
};

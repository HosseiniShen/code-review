import { TYPES, SEVERITY, BELONGTO } from '../interfaces';

export default class Comment {
    private appId!: string;
    private project!: string;
    private filePath!: string;
    private start!: number;
    private end!: number;
    private codeContents!: string;
    private branch!: string;
    private reviewer!: string;
    private coder!: string;
    private comments!: string;
    private type: TYPES = TYPES.PROBLEM;
    private severity: SEVERITY = SEVERITY.TIPS;
    private belongTo: BELONGTO = BELONGTO.CODING_BASIC;
    
    public set setAppId (appId: string) {
        this.appId = appId;
    }

    public get getAppId () {
        return this.appId;
    }

    public set setProject (project: string) {
        this.project = project;
    }

    public get getProject () {
        return this.project;
    }

    public set setFilePath (filePath: string) {
        this.filePath = filePath;
    }

    public get getFilePath () {
        return this.filePath;
    }

    public set setStart (start: number) {
        this.start = start;
    }

    public get getStart () {
        return this.start;
    }

    public set setEnd (end: number) {
        this.end = end;
    }

    public get getEnd () {
        return this.end;
    }

    public set setCodeContents (codeContents: string) {
        this.codeContents = codeContents;
    }

    public get getCodeContents () {
        return this.codeContents;
    }

    public set setBranch (branch: string) {
        this.branch = branch;
    }

    public get getBranch () {
        return this.branch;
    }

    public set setReviewer (reviewer: string) {
        this.reviewer = reviewer;
    }

    public get getReviewer () {
        return this.reviewer;
    }

    public set setCoder (coder: string) {
        this.coder = coder;
    }

    public get getCoder () {
        return this.coder;
    }

    public set setComments (comments: string) {
        this.comments = comments;
    }

    public get getComments () {
        return this.comments;
    }

    public set setType (type: TYPES) {
        this.type = type;
    }

    public get getType () {
        return this.type;
    }

    public set setSeverity (severity: SEVERITY) {
        this.severity = severity;
    }

    public get getSeverity () {
        return this.severity;
    }

    public set setBelongTo (belongTo: BELONGTO) {
        this.belongTo = belongTo;
    }

    public get getBelongTo () {
        return this.belongTo;
    }
}
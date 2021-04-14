
import { window, ViewColumn, ExtensionContext, WebviewPanel } from 'vscode';
import { IMessage, ACTIONS } from '../interfaces';
import * as Utils from '../utils';

export class WebView {
    public webviewTitle: string;
    public viewType: string;

    public messageHandler = {
        [ACTIONS.ERROR] (panel: WebviewPanel, data: any) {
            Utils.warn(data.msg);
        }
    };

    constructor (public context: ExtensionContext, title: string, viewType: string) {
        this.webviewTitle = title;
        this.viewType = viewType;
    }

    create <T>(data: T) {
        const panel = window.createWebviewPanel(
            this.viewType, 
            this.webviewTitle, 
            ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        panel.webview.html = this.getWebviewContent(data);

        this.initMessenger(panel);
    }

    getWebviewContent (data: any) {
        let webviewTitle = this.webviewTitle;
        return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${ webviewTitle }</title>
          </head>
        
          <body></body>
        
        </html>
        `;
    }

    initMessenger (panel: WebviewPanel) {
        panel.webview.onDidReceiveMessage((message: IMessage) => {
            const handler = this.messageHandler[message.action];
            if (handler) {
                const data = message.data;
                handler(panel, data);
            }
        }, undefined, this.context.subscriptions);
    }

}

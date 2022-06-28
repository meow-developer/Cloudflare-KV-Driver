/// <reference types="node" />
export declare namespace FetchInterfaces {
    export interface fetchResponse {
        http: {
            body: NodeJS.ReadableStream | null;
            success: boolean;
            statusCode: number;
            headers: Headers;
        };
        cfRes: any;
    }
    /**
     * @property {type} httpMethod
     * @description The http request method that can be performed
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
     */
    type httpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT";
    type httpContentType = "none" | "json" | "plainText" | "formData";
    export type httpFetchOptions = {
        method: httpMethod;
        path: string;
        params: {
            [key: string]: any;
        } | null;
        body: {
            [key: string]: any;
        } | string | null;
        contentType: httpContentType;
    };
    export interface ownFetchResponse extends fetchResponse {
        isCfNormal: boolean;
        isCfReqSuccess: boolean;
    }
    export {};
}
export declare class CfHttpFetch {
    cfAuth: {
        accountEmail: string;
        accountId: string;
        globalApiKey: string;
    };
    http: FetchInterfaces.httpFetchOptions;
    validateCfResponseMethod: "string" | "full" | "withoutResult";
    /**
     *
     * @param cfAuth
     * @param http
     */
    constructor(cfAuth: {
        accountEmail: string;
        accountId: string;
        globalApiKey: string;
    }, http: {
        method: FetchInterfaces.httpFetchOptions["method"];
        path: FetchInterfaces.httpFetchOptions["path"];
        params: FetchInterfaces.httpFetchOptions["params"];
        body: FetchInterfaces.httpFetchOptions["body"];
        contentType: FetchInterfaces.httpFetchOptions["contentType"];
    }, validateCfResponseMethod?: "string" | "full" | "withoutResult");
    /**
     * @function genParam
     * @private
     * @description Generate the parameters in URL parameter format
     * @returns {Object} The URL format parameters
     */
    private genParam;
    /**
     * @function genFetch
     * @description Generate the fetch request by combining the request path, body, headers, and http method
     * @param reqBody
     * @param headers
     * @returns {Response}
     */
    private genFetch;
    /**
     * @function contentTypeSwitcher
     * @async
     * @description
     * @returns
     */
    private contentTypeSwitcher;
    /**
     * @function httpResParser
     * @param httpRes
     */
    private httpResParser;
    /**
     * @function isCfResNormal
     * @description Analyzing whether the content of the response from Cloudflare is normal
     * @param res
     */
    protected isCfResNormal(res: FetchInterfaces.fetchResponse): boolean;
    /**
     * @function isCfSuccess
     * @description Analyzing whether the database operation has been performed successfully
     * @param isCfResNormal
     * @param res
     */
    protected isCfSuccess(isCfResNormal: boolean, res: FetchInterfaces.fetchResponse): boolean;
    /**
     * @function fetch
     * @async
     * @description
     * @returns {Promise}
     */
    fetch(): Promise<FetchInterfaces.ownFetchResponse>;
}

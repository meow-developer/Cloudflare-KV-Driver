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
    type fetchMaterialBodyHeaders = {
        method: httpMethod;
        body: string | FormData | null;
        headers: {
            [key: string]: string;
        };
    };
    export type fetchMaterial = [string, fetchMaterialBodyHeaders];
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
     * @constructor
     * @param {Object} cfAuth - The authentication information that used to access the Cloudflare KV services
     * @param {Object} http - The HTTP request information
     * @param {string} validateCfResponseMethod - The method that used to validate the response from Cloudflare
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
     * @description Converting the URL parameters into a suitable format
     * @returns {Object} - The URL format parameters
     */
    private genParam;
    /**
     * @function genFetch
     * @description Generate the fetch request based on the request path, body, headers, and http method
     * @param reqBody - The HTTP request body
     * @param headers - The HTTP request headers
     * @returns {Array} - The materials that can be used to make the fetch request for the NodeFetch module
     */
    private genFetch;
    /**
     * @function contentTypeSwitcher
     * @description Generate a suitable HTTP request data based on the content type
     * @returns - The materials that can be used to make the fetch request for the NodeFetch module
     */
    private contentTypeSwitcher;
    /**
     * @function httpResParser
     * @description Parsing the HTTP response that's sent from Cloudflare
     * @param httpRes - The HTTP response from Cloudflare that's processed by the NodeFetch module
     */
    private httpResParser;
    /**
     * @function isCfResNormal
     * @description Checking whether the content of the response from Cloudflare is normal
     * @param {object} res - The response that's processed by the httpResParser function
     */
    protected isCfResNormal(res: FetchInterfaces.fetchResponse): boolean;
    /**
     * @function isCfSuccess
     * @description Checking whether the database operation has been performed successfully
     * @param {boolean} isCfResNormal - The value indicates whether the Cloudflare response is normal
     * @param res - The response that's processed by the httpResParser function
     */
    protected isCfSuccess(isCfResNormal: boolean, res: FetchInterfaces.fetchResponse): boolean;
    /**
     * @async
     * @function fetch
     * @description Performing and handling the fetch request
     */
    fetch(): Promise<FetchInterfaces.ownFetchResponse>;
}

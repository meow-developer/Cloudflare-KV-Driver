/** Downloaded interfaces */
import { Response } from 'node-fetch/@types/index'

/** Local Modules */
import { WorkersKvError } from './util.js';

/** Downloaded Modules */
import fetch, { FormData, RequestInit } from 'node-fetch';
import { URLSearchParams } from 'url';
import { serializeError } from 'serialize-error'

const CF_API_ENDPOINT = "https://api.cloudflare.com/client/v4"
const CF_KV_API_PATH = "storage/kv"


export namespace FetchInterfaces {
    export interface fetchResponse {
        http: {
            body: NodeJS.ReadableStream | null,
            success: boolean
            statusCode: number,
            headers: Headers
        },
        cfRes: any,
    }
    /**
     * @property {type} httpMethod
     * @description The http request method that can be performed
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
     */
    type httpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT"
    type httpContentType = "none" | "json" | "plainText" | "formData"

    export type httpFetchOptions = {
        method: httpMethod,
        path: string,
        params: { [key: string]: any} | null,
        body: { [key: string]: any } | string | null,
        contentType: httpContentType
    }
    export interface ownFetchResponse extends fetchResponse{
        isCfNormal: boolean
        isCfReqSuccess: boolean
    }

    export type fetchMaterial = [string, RequestInit]
}

export class CfHttpFetch{
    cfAuth: {
        accountEmail: string
        accountId: string
        globalApiKey: string
    }
    http: FetchInterfaces.httpFetchOptions
    validateCfResponseMethod: "string" | "full" | "withoutResult"
    /**
     * @constructor
     * @param {Object} cfAuth - The authentication information that used to access the Cloudflare KV service
     * @param {Object} http - The HTTP request information
     * @param {string} validateCfResponseMethod - The method that used to validate the response from Cloudflare
     */
    constructor(
        cfAuth: {
            accountEmail: string
            accountId: string
            globalApiKey: string
        },
        http: {
            method: FetchInterfaces.httpFetchOptions["method"],
            path: FetchInterfaces.httpFetchOptions["path"],
            params: FetchInterfaces.httpFetchOptions["params"],
            body: FetchInterfaces.httpFetchOptions["body"],
            contentType: FetchInterfaces.httpFetchOptions["contentType"]
        },
        validateCfResponseMethod: "string" | "full" | "withoutResult" = "full"
    ){
        this.cfAuth = {
            accountId: cfAuth.accountId,
            globalApiKey: cfAuth.globalApiKey,
            accountEmail: cfAuth.accountEmail
        }
        this.http = {
            method: http.method,
            path: http.path,
            params: http.params,
            body: http.body,
            contentType: http.contentType
        }
        this.validateCfResponseMethod = validateCfResponseMethod

    }
    /**
     * @function genParam
     * @private
     * @description Converting the URL parameters into a suitable format
     * @returns {Object} - The URL format parameters
     */
    private genParam(): URLSearchParams{
        const params = this.http.params;
        if (params === null) {throw "Parameter is missing"}                    
        const formattedParams = new URLSearchParams();
        for (const key of Object.keys(params) ){
            formattedParams.append(key, params[key])
        }
        return formattedParams;
    }
    /**
     * @function genFetch
     * @description Generate the fetch request based on the request path, body, headers, and http method
     * @param reqBody - The HTTP request body
     * @param headers - The HTTP request headers
     * @returns {Array} - The materials that can be used to make the fetch request for the NodeFetch module
     */
    private genFetch(reqBody: string | FormData | null, headers: {[key: string]: string} = {}): FetchInterfaces.fetchMaterial {
        
        const DEFAULT_PATH = `${CF_API_ENDPOINT}/accounts/${this.cfAuth.accountId}/${CF_KV_API_PATH}/`

        const DEFAULT_HEADER = {
            "X-Auth-Key": this.cfAuth.globalApiKey,
            "X-Auth-Email": this.cfAuth.accountEmail
        }

        const params = this.http.params;
        const path = this.http.path

        const fullPath = () => { 
            if (params === null) 
                return DEFAULT_PATH + path 
            else 
                return DEFAULT_PATH + path + "?" + this.genParam()
        }

        const nodeFetchOpt: RequestInit = {
            method: this.http.method,
            body: reqBody,
            headers: { ...headers,  ...DEFAULT_HEADER },
            redirect: "error",
            follow: 0
        }

        return [
            fullPath(),
            nodeFetchOpt
        ]


    }
    /**
     * @function contentTypeSwitcher
     * @description Generate a suitable HTTP request data based on the content type
     * @returns - The materials that can be used to make the fetch request for the NodeFetch module
     */
    private contentTypeSwitcher(): FetchInterfaces.fetchMaterial{
        let fetchMaterial: FetchInterfaces.fetchMaterial;
        const body = this.http.body;
        
        const formattedBody = body == null ? undefined: body;

        switch (this.http.contentType){
            case "json":
                if (formattedBody == undefined) throw "body is empty";
                fetchMaterial = this.genFetch(
                    JSON.stringify(formattedBody), {"Content-Type": "application/json"}
                )
                break;
            case "plainText":
                fetchMaterial = this.genFetch(
                    JSON.stringify(formattedBody), {"Content-Type": "text/plain"}
                )
                break;
            case "formData":
                if ( typeof formattedBody !== "object") throw "The formatted body is not an object"

                let formData = new FormData();
                for (const key of Object.keys(formattedBody)){
                    formData.set(key, formattedBody[key])
                }

                fetchMaterial = this.genFetch(
                    formData, {}
                )
                break;
            case "none":
                fetchMaterial = this.genFetch(
                    JSON.stringify(formattedBody), {}
                )
                break;
        }

        return fetchMaterial;
    }
    /**
     * @function httpResParser
     * @description Parsing the HTTP response that's sent from Cloudflare
     * @param httpRes - The HTTP response from Cloudflare that's processed by the NodeFetch module
     */
    private async httpResParser(httpRes: Response): Promise<FetchInterfaces.fetchResponse>{
        return {
            http: {
                body: httpRes.body,
                success: httpRes.ok,
                statusCode: httpRes.status,
                headers: httpRes.headers
            },
            cfRes: await httpRes.json()
        }
    }
    /**
     * @function isCfResNormal
     * @description Checking whether the content of the response from Cloudflare is normal
     * @param {object} res - The response that's processed by the httpResParser function
     */
     protected isCfResNormal(res: FetchInterfaces.fetchResponse): boolean{

        let isNormal: boolean;

        switch (this.validateCfResponseMethod){
            case "withoutResult":
                isNormal = typeof(res.cfRes) == "object"
                if (isNormal){
                    const cfResKey = Object.keys(res.cfRes!);
                    isNormal = cfResKey.includes('success') &&
                                cfResKey.includes('errors') &&
                                cfResKey.includes('messages')
                }
                break;
            case "string":
                isNormal = typeof(res.cfRes) == "string"
                break;
            case "full":
                isNormal = typeof(res.cfRes) == "object"
                if (isNormal){
                    const cfResKey = Object.keys(res.cfRes!);
                    isNormal = cfResKey.includes('success') &&
                                cfResKey.includes('errors') &&
                                cfResKey.includes('messages') &&
                                cfResKey.includes('result')
                }
                break;

        }

        return isNormal;
    }
    /**
     * @function isCfSuccess
     * @description Checking whether the database operation has been performed successfully
     * @param {boolean} isCfResNormal - The value indicates whether the Cloudflare response is normal
     * @param res - The response that's processed by the httpResParser function
     */
    protected isCfSuccess(isCfResNormal: boolean, res: FetchInterfaces.fetchResponse){
        let isSuccess = isCfResNormal && res.http.success;
        if (isSuccess){
            switch (typeof res.cfRes){
                case 'object':
                    isSuccess = res.cfRes["success"] || false;
                    break;
                case "string":
                    isSuccess = true;
                    break;
                default:
                    isSuccess = false;
            }
        }
        return isSuccess;
    }
    /**
     * @async
     * @function fetch
     * @description Performing and handling the fetch request
     */
    public async fetch(): Promise<FetchInterfaces.ownFetchResponse>{
        try{
            const fetchMaterial = this.contentTypeSwitcher();
            const req = await fetch(fetchMaterial[0], fetchMaterial[1])
            const formattedRes = await this.httpResParser(req);

            const isCfNormal = this.isCfResNormal(formattedRes);
            const isCfReqSuccess = this.isCfSuccess(isCfNormal, formattedRes)

            return {
                isCfNormal: isCfNormal,
                isCfReqSuccess: isCfReqSuccess,
                ...formattedRes
            };
        } catch (err) {
            throw new WorkersKvError("Http fetch error", "Error occurred when sending a http request", serializeError(err));
        }
    }
}


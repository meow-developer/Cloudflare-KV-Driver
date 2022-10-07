/** Downloaded interfaces */
import { Response } from 'node-fetch/@types/index'
import { FetchInterfaces } from './interfaces/fetch.js';

/** Local Modules */
import { WorkersKvError } from './util.js';

/** Downloaded Modules */
import fetch, { RequestInit, FormData } from 'node-fetch';
import { URLSearchParams } from 'url';
import { serializeError } from 'serialize-error'
import { CloudflareResponseInterfaces } from './interfaces/cfResponse.js';

const CF_API_ENDPOINT = "https://api.cloudflare.com/client/v4"
const CF_KV_API_PATH = "storage/kv"

/**
 * Fetch responses from Cloudflare
 * @class
 */
export class CfHttpFetch{
    cfAuth: {
        accountEmail: string
        accountId: string
        globalApiKey: string
    }
    http: FetchInterfaces.httpFetchOptions
    validateCfResponseMethod: "string" | "full" | "withoutResult" | false
    /**
     * @constructor
     * @param {Object} cfAuth The authentication information that is used to access the Cloudflare KV service
     * @param {Object} http HTTP request information for database operations.
     * @param {string} validateCfResponseMethod The method that used to validate the response from Cloudflare
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
        validateCfResponseMethod: "string" | "full" | "withoutResult" | false = "full"
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
     * Converting URL parameters into a suitable format for performing a HTTP request
     * @function genParam
     * @private
     * @returns {Object} Formatted URL parameters
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
     * Generating a fetch request based on the request path, body, headers, and http method
     * @function genFetch
     * @description 
     * @param reqBody The HTTP request body
     * @param headers The HTTP request headers
     * @returns {Array} A full endpoint URL path and a configuration for the NodeFetch module
     */
    private genFetch(reqBody: any, headers: {[key: string]: string} = {}): FetchInterfaces.fetchMaterial {
        
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
     * Generating a suitable HTTP request based on the content type
     * @function contentTypeSwitcher
     * @returns {Array} Materials that can be used to perform the a request for the NodeFetch module
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
     * Parsing the HTTP response that's sent from Cloudflare
     * @function httpResParser
     * @param {Response} httpRes A HTTP response from Cloudflare that's processed by the NodeFetch module
     * @returns {Object} A full information about the HTTP request, database operation perform status, and other Cloudflare responses.
     */
    private async httpResParser(httpRes: Response): Promise<FetchInterfaces.FetchResponse>{
        let cfRes: FetchInterfaces.FetchResponse["cfRes"];
        const RES_CONTENT_TYPE =  httpRes.headers.get("Content-Type");
        
        const ACCEPTABLE_CONTENT_TYPES = ["application/json; charset=UTF-8", "application/octet-stream"];
        const CONVERT_TO_SHORTEN_TYPES = ["object", "string"];

        const RES_SHORTEN_CONTENT_TYPE = CONVERT_TO_SHORTEN_TYPES[ACCEPTABLE_CONTENT_TYPES.indexOf(RES_CONTENT_TYPE!)];

        const http = {
            body: httpRes.body,
            success: httpRes.ok,
            statusCode: httpRes.status,
            headers: httpRes.headers
        }

        switch (RES_SHORTEN_CONTENT_TYPE) {
            case "object":
                cfRes = await httpRes.json() as
                            CloudflareResponseInterfaces.GeneralResponse | CloudflareResponseInterfaces.ResultInfoResponse;
                break;
            case "string":
                const temp: string = await httpRes.text();
                cfRes = temp.substring(1, temp.length - 1)
                break;
            default:
                throw new WorkersKvError("Receive an unforeseen response type from Cf", 
                                            "Please refer to the content type of the response", 
                                            {"contentType": RES_CONTENT_TYPE})
        }

        return { http: http, httpResShortenContentType: RES_SHORTEN_CONTENT_TYPE, cfRes: cfRes };
    }
    /**
     * Checking whether the content of the response from Cloudflare is normal
     * @function isCfResNormal
     * @param {object} res The response that's processed by the httpResParser function
     * @returns {boolean} True when the response is normal, false otherwise.
     */
     protected isCfResNormal(res: FetchInterfaces.FetchResponse): boolean{

        const GENERAL_CF_OBJ_EXPECTED_KEYS = ["success", "errors", "messages"];

        let isNormal: boolean = false;

        switch (this.validateCfResponseMethod){
            case "withoutResult":
                isNormal = res.httpResShortenContentType == "object";
                if (isNormal){
                    const cfResKey = Object.keys(res.cfRes!);
                    GENERAL_CF_OBJ_EXPECTED_KEYS.map((value)=>{ 
                        isNormal = isNormal && cfResKey.includes(value); 
                    })
                }
                break;
            case "string":
                isNormal = res.httpResShortenContentType == "string";
                break;
            case "full":
                isNormal = res.httpResShortenContentType == "object";
                if (isNormal){
                    const cfResKey = Object.keys(res.cfRes!);
                    ["result", ...GENERAL_CF_OBJ_EXPECTED_KEYS].map((value)=>{
                        isNormal = isNormal && cfResKey.includes(value); 
                    })
                }
                break;
        }

        return isNormal;
    }
    /**
     * Checking whether the database operation has been performed successfully
     * @function isCfSuccess
     * @param {boolean} isCfResNormal The value indicates whether the Cloudflare response is normal
     * @param res The response that stores information about the HTTP request, database operation perform status, and other Cloudflare responses
     * @returns {boolean} True when the db operation has been performed successfully; and vice versa.
     */
    protected isCfSuccess(isCfResNormal: boolean | null, res: FetchInterfaces.FetchResponse){
        let isSuccess: boolean | null = isCfResNormal == false ? null : res.http.success;

        if (isSuccess){
            switch (res.httpResShortenContentType){
                case "object":
                    isSuccess = (res.cfRes as CloudflareResponseInterfaces.GeneralResponse)["success"] || false;
                    break;
                case "string":
                    isSuccess = true;
                    break;
            }
        }
        return isSuccess;
    }

    /**
     * Parsing error message from the Cloudflare response
     * @protected
     * @function cfError
     * @returns {(null|CloudflareResponseInterfaces.GeneralResponse["errors"])} null when there's no error; The error received from Cloudflare about the database operation request.
     */
    protected cfError(res: FetchInterfaces.FetchResponse): 
            CloudflareResponseInterfaces.GeneralResponse["errors"] | null {
        if (res.httpResShortenContentType === "string"){
            return null;
        } else {
            return (res.cfRes as CloudflareResponseInterfaces.GeneralResponse)["errors"];
        }
    }

    /**
     * Performing and handling the fetch request
     * @async
     * @function fetch
     * @returns {OwnFetchResponse} A full information about the HTTP request, database operation perform status, and other Cloudflare responses
     * @throws {WorkersKvError} 
     */
    public async fetch(): Promise<FetchInterfaces.OwnFetchResponse>{
        try{
            const fetchMaterial = this.contentTypeSwitcher();
            const req = await fetch(fetchMaterial[0], fetchMaterial[1])
            const formattedRes = await this.httpResParser(req);
            
            //Null means whether the Cf response is normal is uncertain 
            let isCfNormal: null | boolean = null;
            if (this.validateCfResponseMethod) isCfNormal = this.isCfResNormal(formattedRes);

            const isCfReqSuccess = this.isCfSuccess(isCfNormal, formattedRes);

            const cfError = isCfReqSuccess === true ? null : this.cfError(formattedRes);

            return {
                isCfNormal: isCfNormal,
                isCfReqSuccess: isCfReqSuccess,
                cfError: cfError,
                ...formattedRes
            };
        } catch (err) {
            throw new WorkersKvError("Http fetch error", 
                                        "Error occurred when sending a http request", 
                                        serializeError(err));
        }
    }
}


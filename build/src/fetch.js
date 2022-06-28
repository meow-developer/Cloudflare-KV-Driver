/** Local Modules */
import { CustomError } from './util.js';
/** Downloaded Modules */
import fetch, { FormData } from 'node-fetch';
import { URLSearchParams } from 'url';
import { serializeError } from 'serialize-error';
const CF_API_ENDPOINT = "https://api.cloudflare.com/client/v4";
const CF_KV_API_PATH = "storage/kv";
export class CfHttpFetch {
    /**
     *
     * @param cfAuth
     * @param http
     */
    constructor(cfAuth, http, validateCfResponseMethod = "full") {
        this.cfAuth = {
            accountId: cfAuth.accountId,
            globalApiKey: cfAuth.globalApiKey,
            accountEmail: cfAuth.accountEmail
        };
        this.http = {
            method: http.method,
            path: http.path,
            params: http.params,
            body: http.body,
            contentType: http.contentType
        };
        this.validateCfResponseMethod = validateCfResponseMethod;
    }
    /**
     * @function genParam
     * @private
     * @description Generate the parameters in URL parameter format
     * @returns {Object} The URL format parameters
     */
    genParam() {
        const params = this.http.params;
        if (params === null) {
            throw "Parameter is missing";
        }
        const formattedParams = new URLSearchParams();
        for (const key of Object.keys(params)) {
            formattedParams.append(key, params[key]);
        }
        return formattedParams;
    }
    /**
     * @function genFetch
     * @description Generate the fetch request by combining the request path, body, headers, and http method
     * @param reqBody
     * @param headers
     * @returns {Response}
     */
    async genFetch(reqBody, headers = {}) {
        const DEFAULT_PATH = `${CF_API_ENDPOINT}/accounts/${this.cfAuth.accountId}/${CF_KV_API_PATH}/`;
        const DEFAULT_HEADER = {
            "X-Auth-Key": this.cfAuth.globalApiKey,
            "X-Auth-Email": this.cfAuth.accountEmail
        };
        const params = this.http.params;
        const path = this.http.path;
        const fullPath = () => {
            if (params === null)
                return DEFAULT_PATH + path;
            else
                return DEFAULT_PATH + path + "?" + this.genParam();
        };
        return (await fetch(fullPath(), {
            method: this.http.method,
            body: reqBody,
            headers: { ...headers, ...DEFAULT_HEADER }
        }));
    }
    /**
     * @function contentTypeSwitcher
     * @async
     * @description
     * @returns
     */
    async contentTypeSwitcher() {
        let response;
        const body = this.http.body;
        const formattedBody = body == null ? undefined : body;
        switch (this.http.contentType) {
            case "json":
                if (formattedBody == undefined)
                    throw "body is empty";
                response = this.genFetch(JSON.stringify(formattedBody), { "Content-Type": "application/json" });
                break;
            case "plainText":
                response = this.genFetch(JSON.stringify(formattedBody), { "Content-Type": "text/plain" });
                break;
            case "formData":
                let formData = new FormData();
                if (typeof (formattedBody) !== "object")
                    throw "Received non object data to form a formData";
                for (const key of Object.keys(formattedBody)) {
                    formData.set(key, formattedBody[key]);
                }
                response = this.genFetch(formData, {});
                break;
            case "none":
                response = this.genFetch(JSON.stringify(formattedBody), {});
                break;
        }
        return response;
    }
    /**
     * @function httpResParser
     * @param httpRes
     */
    async httpResParser(httpRes) {
        return {
            http: {
                body: httpRes.body,
                success: httpRes.ok,
                statusCode: httpRes.status,
                headers: httpRes.headers
            },
            cfRes: await httpRes.json()
        };
    }
    /**
     * @function isCfResNormal
     * @description Analyzing whether the content of the response from Cloudflare is normal
     * @param res
     */
    isCfResNormal(res) {
        let isNormal = res.http.success;
        switch (this.validateCfResponseMethod) {
            case "full":
                isNormal = typeof (res.cfRes) == "object";
                if (isNormal) {
                    const cfResKey = Object.keys(res.cfRes);
                    isNormal = cfResKey.includes('success') &&
                        cfResKey.includes('errors') &&
                        cfResKey.includes('messages') &&
                        cfResKey.includes('result');
                }
                break;
            case "withoutResult":
                isNormal = typeof (res.cfRes) == "object";
                if (isNormal) {
                    const cfResKey = Object.keys(res.cfRes);
                    isNormal = cfResKey.includes('success') &&
                        cfResKey.includes('errors') &&
                        cfResKey.includes('messages');
                }
                break;
            case "string":
                isNormal = typeof (res.cfRes) == "string";
                break;
        }
        return isNormal;
    }
    /**
     * @function isCfSuccess
     * @description Analyzing whether the database operation has been performed successfully
     * @param isCfResNormal
     * @param res
     */
    isCfSuccess(isCfResNormal, res) {
        let isSuccess = false;
        if (isCfResNormal) {
            switch (typeof res.cfRes) {
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
     * @function fetch
     * @async
     * @description
     * @returns {Promise}
     */
    async fetch() {
        try {
            const req = await this.contentTypeSwitcher();
            const formattedRes = await this.httpResParser(req);
            const isCfNormal = this.isCfResNormal(formattedRes);
            const isCfReqSuccess = this.isCfSuccess(isCfNormal, formattedRes);
            return {
                isCfNormal: isCfNormal,
                isCfReqSuccess: isCfReqSuccess,
                ...formattedRes
            };
        }
        catch (err) {
            throw new CustomError("Http fetch error", "Error occurred when sending a http request", serializeError(err));
        }
    }
}

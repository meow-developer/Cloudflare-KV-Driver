import { FetchInterfaces } from './interfaces/fetch.js';
import { CloudflareResponseInterfaces } from './interfaces/cfResponse.js';
/**
 * Fetch responses from Cloudflare
 * @class
 */
export declare class CfHttpFetch {
    cfAuth: {
        accountEmail: string;
        accountId: string;
        globalApiKey: string;
    };
    http: FetchInterfaces.httpFetchOptions;
    validateCfResponseMethod: "string" | "full" | "withoutResult" | false;
    /**
     * @constructor
     * @param {Object} cfAuth The authentication information that is used to access the Cloudflare KV service
     * @param {Object} http HTTP request information for database operations.
     * @param {string} validateCfResponseMethod The method that used to validate the response from Cloudflare
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
    }, validateCfResponseMethod?: "string" | "full" | "withoutResult" | false);
    /**
     * Converting URL parameters into a suitable format for performing a HTTP request
     * @function genParam
     * @private
     * @returns {Object} Formatted URL parameters
     */
    private genParam;
    /**
     * Generating a fetch request based on the request path, body, headers, and http method
     * @function genFetch
     * @description
     * @param reqBody The HTTP request body
     * @param headers The HTTP request headers
     * @returns {Array} A full endpoint URL path and a configuration for the NodeFetch module
     */
    private genFetch;
    /**
     * Generating a suitable HTTP request based on the content type
     * @function contentTypeSwitcher
     * @returns {Array} Materials that can be used to perform the a request for the NodeFetch module
     */
    private contentTypeSwitcher;
    /**
     * Parsing the HTTP response that's sent from Cloudflare
     * @function httpResParser
     * @param {Response} httpRes A HTTP response from Cloudflare that's processed by the NodeFetch module
     * @returns {Object} A full information about the HTTP request, database operation perform status, and other Cloudflare responses.
     */
    private httpResParser;
    /**
     * Checking whether the content of the response from Cloudflare is normal
     * @function isCfResNormal
     * @param {object} res The response that's processed by the httpResParser function
     * @returns {boolean} True when the response is normal, false otherwise.
     */
    protected isCfResNormal(res: FetchInterfaces.FetchResponse): boolean;
    /**
     * Checking whether the database operation has been performed successfully
     * @function isCfSuccess
     * @param {boolean} isCfResNormal The value indicates whether the Cloudflare response is normal
     * @param res The response that stores information about the HTTP request, database operation perform status, and other Cloudflare responses
     * @returns {boolean} True when the db operation has been performed successfully; and vice versa.
     */
    protected isCfSuccess(isCfResNormal: boolean | null, res: FetchInterfaces.FetchResponse): boolean | null;
    /**
     * Parsing error message from the Cloudflare response
     * @protected
     * @function cfError
     * @returns {(null|CloudflareResponseInterfaces.GeneralResponse["errors"])} null when there's no error; The error received from Cloudflare about the database operation request.
     */
    protected cfError(res: FetchInterfaces.FetchResponse): CloudflareResponseInterfaces.GeneralResponse["errors"] | null;
    /**
     * Performing and handling the fetch request
     * @async
     * @function fetch
     * @returns {OwnFetchResponse} A full information about the HTTP request, database operation perform status, and other Cloudflare responses
     * @throws {WorkersKvError}
     */
    fetch(): Promise<FetchInterfaces.OwnFetchResponse>;
}

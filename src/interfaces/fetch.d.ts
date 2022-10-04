import { CloudflareResponseInterfaces } from "./cfResponse.js"

export namespace FetchInterfaces {
    export interface FetchResponse {
        http: {
            body: NodeJS.ReadableStream | null,
            success: boolean
            statusCode: number,
            headers: Headers
        },
        httpResShortenContentType: "object" | "string",
        cfRes: CloudflareResponseInterfaces.generalResponse 
                | CloudflareResponseInterfaces.ResultInfoRes | string,
    }
    /**
     * @property {type} httpMethod
     * @description The http request method that can be performed
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods} The modern HTTP request methods
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
    export interface OwnFetchResponse extends FetchResponse{
        isCfNormal: boolean | null
        isCfReqSuccess: boolean | null
        cfError: CloudflareResponseInterfaces.generalResponse["errors"] | null
    }

    export type fetchMaterial = [string, RequestInit]
}
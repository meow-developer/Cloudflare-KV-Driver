export namespace CloudflareResponseInterfaces {
  type errorMsg = { code: number, message: string }
  /**
   * @see {@link https://api.cloudflare.com/#getting-started-responses}
   */
  interface GeneralResponse {
    "success": boolean,
    "errors": Array<errorMsg>,
    "messages": Array<any>,
    "result": Array<any> | { [key: string]: any }
  }
  interface ResultInfoResponse extends GeneralResponse {
    "result_info": {
      count: number,
      cursor: string
    }
  }
  /**
   * @see {@link https://api.cloudflare.com/#workers-kv-namespace-list-a-namespace-s-keys}
   */
  interface NamespaceRes extends GeneralResponse["result"] {
    id: string,
    title: string,
    supports_url_encoding: string
  }

  /**
   * @see {@link https://api.cloudflare.com/#workers-kv-namespace-list-a-namespace-s-keys}
   */
  interface NamespaceKeysRes {
    result: Array<[
      {
        name: string,
        expiration?: number,
        metadata?: {
          someMetadataKey: string
        }
      }
    ]>,
    result_info: ResultInfoResponse["result_info"]
  }
}


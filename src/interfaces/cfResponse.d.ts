export namespace CloudflareResponseInterfaces {
    interface generalResponse {
        "success": boolean,
        "errors": Array<any>,
        "messages": Array<any>,
        "result": Array<any> | {[key: string]: any}
    }
    interface listNamespaces extends generalResponse["result"]{
        id : string,
        title: string,
        supports_url_encoding: string
    }

    interface createNamespace extends listNamespaces {}
    
    interface listNamespaceKeys extends generalResponse["result"]{
        result: Array<[
            {
              name: string,
              expiration?: number,
              metadata?: {
                someMetadataKey: string
              }
            }
          ]>,
          result_info: {
            count: number,
            cursor: string
          }
    }
}


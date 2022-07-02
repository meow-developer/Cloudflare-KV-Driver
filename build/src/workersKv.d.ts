/** Local interfaces */
import { FetchInterfaces } from './fetch.js';
import { CloudflareResponseInterfaces } from './interfaces/cfResponse.js';
export declare namespace WorkersKvInterfaces {
    interface bridgeCommand {
        commandType: "CRUD" | "namespace" | "other";
        command: string;
        input: {
            relativePathParam: {
                [key: string]: string;
            } | null;
            data: {
                [key: string]: any;
            } | null;
            urlParam: {
                [key: string]: any;
            } | null;
        };
    }
}
export declare class WorkersKv {
    private cfAuth;
    private extensionArg;
    /**
     * @constructor
     * @see https://api.cloudflare.com/#getting-started-requests
     * @param {string} accountId The ID of the Cloudflare account
     * @param {string} apiToken The Api token that has the read and write access to the KV service
     * @param {Array[Function]} extensionArg The extensional functions that want to be executed after the database operation has been being performed
     * @example
     * const kvMonitor = new WorkersKvMonitor()
     * const workersKv = new WorkersKv(process.env["CF_EMAIL"], process.env["CF_ACCOUNT_ID"], process.env["CF_GLOBAL_API_KEY"], kvMonitor.dbListener.bind(kvMonitor))
     */
    constructor(accountEmail: string, accountId: string, globalApiKey: string, ...extensionArg: Array<Function>);
    /**
     * @function bridge
     * @async
     * @private
     * @description Handles the database operation that wants to be performed. It conveys the database operation request to the fetch function, receives the response from the fetch function, and send the whole database operation information to the function handler for extension purpose.
     * @param {Object} command - The requested database operation
     * @param {Object} http - The http request for the database operation
     * @returns {Promise} - A full response (including whole http response) from Cloudflare
     */
    protected bridge(command: WorkersKvInterfaces.bridgeCommand, http: FetchInterfaces.httpFetchOptions, validateCfResponseMethod?: "string" | "full" | "withoutResult"): Promise<FetchInterfaces.ownFetchResponse>;
    /**
     * @function funcArgHandlers
     * @description It sends the database operation information to the function placed in the extensionArg of the class constructor
     * @param {boolean} processSuccess - Indicates whether the database operation has been performed successfully
     * @param {object} command - The requested database operation
     * @param {object} cfFetch - The response from Cloudflare on the database operation
     * @param {object} errDetail - The error detail of the database operation
     */
    protected funcArgHandlers(processSuccess: boolean, command: WorkersKvInterfaces.bridgeCommand, cfFetchRes?: FetchInterfaces.fetchResponse | null, errDetail?: {
        [key: string]: any;
    } | null): void;
    /**
     * @function genReturnFromCfRes
     * @description Parsing and returning the Cloudflare response. Throw error when the database operation failed.
     * @param {string} method Returning part of the Cloudflare response
     */
    private genReturnFromCfRes;
    /**
     * @function listNamespaces
     * @public
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-namespaces
     * @param {object} urlParam - The parameters that are in the URL
     * @param {number} urlParam.page - Page number of paginated results
     * @param {number} urlParam.perPage - Maximum number of results per page
     * @param {string} urlParam.order - Field to order results by
     * @param {string} urlParam.direction - Direction to order namespaces
     */
    listNamespaces(urlParam?: {
        page?: number;
        per_page?: number;
        order?: "id" | "title";
        direction?: "asc" | "desc";
    }): Promise<Array<CloudflareResponseInterfaces.listNamespaces>>;
    /**
     * @function createNamespace
     * @description Creates a namespace under the given title. A 400 is returned if the account already owns a namespace with this title. A namespace must be explicitly deleted to be replaced.
     * @public
     * @see https://api.cloudflare.com/#workers-kv-namespace-create-a-namespace
     * @param {object} data - The main data that will send to Cloudflare
     * @param {string} data.title - A human-readable string name for a Namespace.
     */
    createNamespace(data: {
        title: string;
    }): Promise<CloudflareResponseInterfaces.createNamespace>;
    /**
     * @public
     * @async
     * @function removeNamespace
     * @description Deletes the namespace corresponding to the given ID.
     * @see https://api.cloudflare.com/#workers-kv-namespace-remove-a-namespace
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     */
    removeNamespace(relativePathParam: {
        namespaceId: string;
    }): Promise<boolean>;
    /**
     * @public
     * @async
     * @function renameNamespace
     * @description - Modifies a namespace's title.
     * @see https://api.cloudflare.com/#workers-kv-namespace-rename-a-namespace
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {object} data - The main data that will send to Cloudflare
     * @param {string} data.title - A human-readable string name for a Namespace.
     */
    renameNamespace(relativePathParam: {
        namespaceId: string;
    }, data: {
        title: string;
    }): Promise<boolean>;
    /**
     * @public
     * @async
     * @function listNamespaceKeys
     * @see https://api.cloudflare.com/#workers-kv-namespace-list-a-namespace-s-keys
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {object} urlParam - The parameters at the end of URL
     * @param {number} urlParam.limit - The number of keys to return. The cursor attribute may be used to iterate over the next batch of keys if there are more than the limit.
     * @param {string} urlParam.cursor - Opaque token indicating the position from which to continue when requesting the next set of records if the amount of list results was limited by the limit parameter. A valid value for the cursor can be obtained from the cursors object in the result_info structure.
     * @param {string} urlParam.prefix - A string prefix used to filter down which keys will be returned. Exact matches and any key names that begin with the prefix will be returned.
     */
    listNamespaceKeys(relativePathParam: {
        namespaceId: string;
    }, urlParam?: {
        limit?: number;
        cursor?: string;
        prefix?: string;
    }): Promise<CloudflareResponseInterfaces.listNamespaceKeys>;
    /**
     * @public
     * @async
     * @function readKeyValuePair
     * @see https://api.cloudflare.com/#workers-kv-namespace-read-key-value-pair
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {string} relativePathParam.keyName - The name of the key
     */
    readKeyValuePair(relativePathParam: {
        namespaceId: string;
        keyName: string;
    }): Promise<string>;
    /**
     * @public
     * @async
     * @function readKeyMeta
     * @description Returns the metadata associated with the given key in the given namespace. Use URL-encoding to use special characters (e.g. :, !, %) in the key name.
     * @see https://api.cloudflare.com/#workers-kv-namespace-read-the-metadata-for-a-key
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {string} relativePathParam.keyName - The name of the key
     */
    readKeyMeta(relativePathParam: {
        namespaceId: string;
        keyName: string;
    }): Promise<any>;
    /**
     * @public
     * @async
     * @function writeKeyValuePair
     * @description Write a value identified by a key. Use URL-encoding to use special characters (e.g. :, !, %) in the key name. Body should be the value to be stored. Existing values and expirations will be overwritten. If neither expiration nor expiration_ttl is specified, the key-value pair will never expire. If both are set, expiration_ttl is used and expiration is ignored.
     * @see https://api.cloudflare.com/#workers-kv-namespace-write-key-value-pair
     * @param {Object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {string} relativePathParam.keyName - The name of the key
     * @param {string} value - A UTF-8 encoded string to be stored, up to 10 MB in length.
     * @param {Object} urlParam - The parameters at the end of URL
     * @param {number} urlParam.expiration
     * @param {number} urlParam.expiration_ttl
     */
    writeKeyValuePair(relativePathParam: {
        namespaceId: string;
        keyName: string;
    }, value: string, urlParam?: {
        expiration?: number;
        expiration_ttl?: number;
    }): Promise<boolean>;
    /**
     * @public
     * @async
     * @function writeKeyValuePairMeta
     * @description Write a value identified by a key. Use URL-encoding to use special characters (e.g. :, !, %) in the key name. Body should be the value to be stored along with json metadata to be associated with the key/value pair. Existing values, expirations and metadata will be overwritten. If neither expiration nor expiration_ttl is specified, the key-value pair will never expire. If both are set, expiration_ttl is used and expiration is ignored.
     * @see https://api.cloudflare.com/#workers-kv-namespace-write-key-value-pair-with-metadata
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {string} relativePathParam.keyName - The name of the key
     * @param {object} data - The main data that will send to Cloudflare
     * @param {string} data.value - A byte sequence to be stored, up to 10 MB in length.
     * @param {object} data.metadata - Arbitrary JSON to be associated with a key/value pair
     * @param {object} urlParam - The parameters at the end of URL
     * @param {number} urlParam.expiration
     * @param {number} urlParam.expiration_ttl
     */
    writeKeyValuePairMeta(relativePathParam: {
        namespaceId: string;
        keyName: string;
    }, data: {
        value: string;
        metadata: {
            [key: string]: any;
        };
    }, urlParam?: {
        expiration?: number;
        expiration_ttl?: number;
    }): Promise<boolean>;
    /**
     * @public
     * @async
     * @function writeMultipleKeyValuePairs
     * @description Write multiple keys and values at once. Body should be an array of up to 10,000 key-value pairs to be stored, along with optional expiration information. Existing values and expirations will be overwritten. If neither expiration nor expiration_ttl is specified, the key-value pair will never expire. If both are set, expiration_ttl is used and expiration is ignored. The entire request size must be 100 megabytes or less.
     * @see https://api.cloudflare.com/#workers-kv-namespace-write-multiple-key-value-pairs
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {object} data - The data that will send to Cloudflare
     * @param {string} data.key - A key's name. The name may be at most 512 bytes. All printable, non-whitespace characters are valid.
     * @param {string} data.value - A UTF-8 encoded string to be stored, up to 10 MB in length.
     * @param {number} data.expiration - The time, measured in number of seconds since the UNIX epoch, at which the key should expire.
     * @param {number} data.expiration_ttl - The number of seconds for which the key should be visible before it expires. At least 60.
     * @param {object} data.metadata - Arbitrary JSON that is associated with a key
     * @param {boolean} data.base64 - Whether or not the server should base64 decode the value before storing it. Useful for writing values that wouldn't otherwise be valid JSON strings, such as images.
     */
    writeMultipleKeyValuePairs(relativePathParam: {
        namespaceId: string;
    }, data: Array<{
        key: string;
        value: string;
        expiration?: number;
        expiration_ttl?: number;
        metadata?: {
            [key: string]: any;
        };
        base64?: boolean;
    }>): Promise<boolean>;
    /**
     * @public
     * @async
     * @function deleteKeyValuePair
     * @description Remove a KV pair from the Namespace. Use URL-encoding to use special characters (e.g. :, !, %) in the key name.
     * @see https://api.cloudflare.com/#workers-kv-namespace-delete-key-value-pair
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {string} relativePathParam.keyName - The name of the key
     */
    deleteKeyValuePair(relativePathParam: {
        namespaceId: string;
        keyName: string;
    }): Promise<boolean>;
    /**
     * @public
     * @async
     * @function deleteMultipleKeyValuePairs
     * @description Remove multiple KV pairs from the Namespace. Body should be an array of up to 10,000 keys to be removed.
     * @see https://api.cloudflare.com/#workers-kv-namespace-delete-multiple-key-value-pairs
     * @param {object} relativePathParam - The parameters in the relative path
     * @param {string} relativePathParam.namespaceId - The namespace identifier
     * @param {object} data - The data that will send to Cloudflare
     * @param {Array} data.keyName - The name of the key
     */
    deleteMultipleKeyValuePairs(relativePathParam: {
        namespaceId: string;
    }, data: {
        keyName: Array<string>;
    }): Promise<boolean>;
    /**Functions' aliases */
    read: (relativePathParam: {
        namespaceId: string;
        keyName: string;
    }) => Promise<string>;
    write: (relativePathParam: {
        namespaceId: string;
        keyName: string;
    }, value: string, urlParam?: {
        expiration?: number;
        expiration_ttl?: number;
    }) => Promise<boolean>;
    delete: (relativePathParam: {
        namespaceId: string;
        keyName: string;
    }) => Promise<boolean>;
}

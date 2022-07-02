export declare const createTempNamespace: (namespaceName: string) => Promise<string>;
export declare const removeTempNamespace: (namespaceId: string) => Promise<void>;
export declare const genTempDbName: (testName: string) => string;

import { WorkersKv, WorkersKvMonitor } from '../src/index.js';
import { DbEventEmit } from '../src/interfaces/monitorEvent.js';
export declare const cfWorkers: WorkersKv;
export declare const createTempNamespace: (namespaceName: string) => Promise<string>;
export declare const removeTempNamespace: (namespaceId: string) => Promise<void>;
export declare const genTempDbName: (testName: string) => string;
export declare const promisifyMonitorStream: (kvMonitor: WorkersKvMonitor, eventType: "success" | "err", timeout: number, dbOperation: {
    func: Function;
    params: Array<any>;
}) => Promise<DbEventEmit.ActivityMsg>;

/** Local Interfaces */
import { WorkersKvInterfaces } from "./interfaces/kv.js";
import { FetchInterfaces } from './interfaces/fetch.js';
import { DbEventEmit } from './interfaces/monitorEvent.js';
/** Import Modules */
import TypedEmitter from "typed-emitter";
/**
 * Monitoring Kv database operations
 * @class
 */
export declare class WorkersKvMonitor {
    private dbActivityProxy;
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter An emitter that uses to emit database activity messages
     */
    constructor();
    /**
     * Receiving and proxying database activities that is from the database operation functions
     * @public
     * @function dbListener
     */
    dbListener(processSuccess: boolean | null, command: WorkersKvInterfaces.BridgeCommand, cfFetch: FetchInterfaces.FetchResponse | null, errDetail: {
        [key: string]: any;
    } | null): void;
    /**
     * Emitting an event when a database activity is received from the proxy
     * @public
     * @function dbMonitorStream
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    dbMonitorStream(): TypedEmitter<DbEventEmit.MonitorEvent>;
}

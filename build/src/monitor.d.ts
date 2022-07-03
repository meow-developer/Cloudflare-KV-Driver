/// <reference types="node" />
/** Local Interfaces */
import { WorkersKvInterfaces } from "./workersKv.js";
import { FetchInterfaces } from './fetch.js';
/** Local Modules */
import { EventEmitter } from "node:events";
export declare class WorkersKvMonitor {
    private dbActivityEmitter;
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter - An emitter that uses to emit any database activity message
     */
    constructor();
    /**
     * @function dbListener
     * @description Receive database activities from the database operation functions
     */
    dbListener(processSuccess: boolean, command: WorkersKvInterfaces.bridgeCommand, cfFetch: FetchInterfaces.fetchResponse | null, errDetail: {
        [key: string]: any;
    } | null): void;
    /**
     * @function dbMonitorStream
     * @description Create an event message when a database activity is received
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    dbMonitorStream(): EventEmitter;
}

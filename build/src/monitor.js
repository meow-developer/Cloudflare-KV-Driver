/** Local Modules */
import { EventEmitter } from "node:events";
/**
 * Monitoring Kv database operations
 * @class
 */
export class WorkersKvMonitor {
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter An emitter that uses to emit database activity messages
     */
    constructor() {
        this.dbActivityProxy = new EventEmitter();
    }
    /**
     * Receiving and proxying database activities that is from the database operation functions
     * @public
     * @function dbListener
     */
    dbListener(processSuccess, command, cfFetch, errDetail) {
        const eventMsg = {
            processSuccess: processSuccess,
            action: command || null,
            cfFetch: cfFetch || null,
            errDetail: errDetail || null
        };
        this.dbActivityProxy.emit("dbActivity", eventMsg);
    }
    /**
     * Emitting an event when a database activity is received from the proxy
     * @public
     * @function dbMonitorStream
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    dbMonitorStream() {
        const monitorEmitter = new EventEmitter();
        this.dbActivityProxy.on("dbActivity", (msg) => {
            const activityMsg = {
                timestamp: new Date(),
                action: msg.action,
                cfResponse: msg.cfFetch
            };
            const errMsg = {
                errorDetail: msg.errDetail,
                ...activityMsg
            };
            switch (msg.processSuccess) {
                case true:
                    monitorEmitter.emit("success", activityMsg);
                    break;
                case false:
                    monitorEmitter.emit("err", errMsg);
                    break;
                case null:
                    monitorEmitter.emit("unknown", errMsg);
                    break;
            }
        });
        return monitorEmitter;
    }
}

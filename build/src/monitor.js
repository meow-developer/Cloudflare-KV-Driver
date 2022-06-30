/** Local Modules */
import { EventEmitter } from "node:events";
export class WorkersKvMonitor {
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter - An emitter that uses to emit any database activity message
     */
    constructor() {
        this.dbActivityEmitter = new EventEmitter();
    }
    /**
     * @function dbListener
     * @description Receive database activities from the database operation functions
     */
    dbListener(processSuccess, command, cfFetch, errDetail) {
        this.dbActivityEmitter.emit("dbActivity", {
            processSuccess: processSuccess || null,
            action: command || null,
            cfFetch: cfFetch || null,
            errDetail: errDetail || null
        });
    }
    /**
     * @function dbMonitorStream
     * @description Create an event message when a database activity is received
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    dbMonitorStream() {
        const monitorEmitter = new EventEmitter();
        this.dbActivityEmitter.on("dbActivity", (msg) => {
            const activityMsg = {
                timestamp: new Date(),
                action: msg.action,
                cfResponse: msg.cfFetch
            };
            switch (msg.processSuccess) {
                case true:
                    monitorEmitter.emit("success", activityMsg);
                    break;
                case false:
                    monitorEmitter.emit("error", {
                        errorDetail: msg.errDetail,
                        ...activityMsg
                    });
            }
        });
        return monitorEmitter;
    }
}

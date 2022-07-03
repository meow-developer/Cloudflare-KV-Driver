/** Local Interfaces */
import { WorkersKvInterfaces } from "./workersKv.js"
import { FetchInterfaces } from './fetch.js'

/** Local Modules */
import { EventEmitter } from "node:events";

type dbActivityEventMsg = {
    processSuccess: boolean,
    action: WorkersKvInterfaces.bridgeCommand,
    cfFetch: FetchInterfaces.fetchResponse,
    errDetail: {[key: string]: any} | null
}

export class WorkersKvMonitor{
    private dbActivityEmitter: EventEmitter
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter - An emitter that uses to emit any database activity message
     */
    constructor(){
        this.dbActivityEmitter = new EventEmitter();
    }
    /**
     * @function dbListener
     * @description Receive database activities from the database operation functions
     */
    public dbListener(processSuccess: boolean,
                command: WorkersKvInterfaces.bridgeCommand,
                cfFetch: FetchInterfaces.fetchResponse | null,
                errDetail: {[key: string]: any} | null){

        this.dbActivityEmitter.emit("dbActivity", {
            processSuccess: processSuccess,
            action: command || null,
            cfFetch: cfFetch|| null,
            errDetail: errDetail || null
        })
        
    }
    /**
     * @function dbMonitorStream
     * @description Create an event message when a database activity is received
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    public dbMonitorStream(): EventEmitter{
        const monitorEmitter = new EventEmitter();
        
        this.dbActivityEmitter.on("dbActivity", (msg: dbActivityEventMsg)=>{

            const activityMsg = {
                timestamp: new Date(),
                action: msg.action,
                cfResponse: msg.cfFetch
            }
    
            switch (msg.processSuccess){
                case true:
                    monitorEmitter.emit("success", activityMsg);
                    break;
                case false:
                    monitorEmitter.emit("error", {
                        errorDetail: msg.errDetail,
                        ...activityMsg
                    })

            }
        })
        return monitorEmitter;
    }
}
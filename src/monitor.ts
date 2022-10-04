/** Local Interfaces */
import { WorkersKvInterfaces } from "./interfaces/kv.js"
import { FetchInterfaces } from './interfaces/fetch.js'
import { DbEventProxy, DbEventEmit } from './interfaces/monitorEvent.js'

/** Local Modules */
import { EventEmitter } from "node:events";

/** Import Modules */
import TypedEmitter from "typed-emitter"

/**
 * Monitoring Kv database operations
 * @class
 */
export class WorkersKvMonitor{
    private dbActivityProxy: TypedEmitter<DbEventProxy.event>
    /**
     * @constructor
     * @property {EventEmitter} dbActivityEmitter An emitter that uses to emit database activity messages
     */
    constructor(){
        this.dbActivityProxy = new EventEmitter() as TypedEmitter<DbEventProxy.event>;
    }
    /**
     * Receiving and proxying database activities that is from the database operation functions
     * @public
     * @function dbListener
     */
    public dbListener(processSuccess: boolean | null,
                command: WorkersKvInterfaces.BridgeCommand,
                cfFetch: FetchInterfaces.FetchResponse | null,
                errDetail: {[key: string]: any} | null): void{
        
        const eventMsg: DbEventProxy.eventMsg = {
            processSuccess: processSuccess,
            action: command || null,
            cfFetch: cfFetch|| null,
            errDetail: errDetail || null
        }
        this.dbActivityProxy.emit("dbActivity", eventMsg)

        
    }
    /**
     * Emitting an event when a database activity is received from the proxy
     * @public
     * @function dbMonitorStream
     * @remarks
     * This function can only be executed before the dbListener function is called. Otherwise, no message will be emitted.
     * @returns {EventEmitter} The event emitter that will generate messages in regard to database activities
     */
    public dbMonitorStream(): TypedEmitter<DbEventEmit.MonitorEvent>{

        const monitorEmitter = new EventEmitter() as TypedEmitter<DbEventEmit.MonitorEvent>;
        
        this.dbActivityProxy.on("dbActivity", (msg)=>{

            const activityMsg = {
                timestamp: new Date(),
                action: msg.action,
                cfResponse: msg.cfFetch
            }

            const errMsg = {
                errorDetail: msg.errDetail,
                ...activityMsg
            }
    
            switch (msg.processSuccess){
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
        })
        return monitorEmitter;
    }
}
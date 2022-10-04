import { WorkersKvInterfaces } from "./kv.js"
import { FetchInterfaces } from "./fetch.js"

export namespace DbEventProxy {
    type eventMsg = {
        processSuccess: boolean | null,
        action: WorkersKvInterfaces.bridgeCommand | null,
        cfFetch: FetchInterfaces.FetchResponse | null,
        errDetail: {[key: string]: any} | null
    }

    type event = {
        "dbActivity": (eventMsg: eventMsg) => void
    }
}


export namespace DbEventEmit {
    type dbActivityEventMsg = {
        processSuccess: boolean,
        action: WorkersKvInterfaces.bridgeCommand,
        cfFetch: FetchInterfaces.FetchResponse,
        errDetail: {[key: string]: any} | null
    }
    
    export interface ActivityMsg {
        timestamp: Date,
        action: dbActivityEventMsg.action,
        cfResponse: dbActivityEventMsg.cfFetch
    }
    
    export interface ErrorMsg extends ActivityMsg {
        errorDetail: dbActivityEventMsg["errDetail"]
    }
    
    export type MonitorEvent = {
        "success": (msg: ActivityMsg) => void
        "err": (msg: ErrorMsg) => void
        "unknown": (msg: ErrorMsg) => void
    }
}
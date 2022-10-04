import { WorkersKv, WorkersKvMonitor } from '../src/index.js'
import { DbEventEmit } from '../src/interfaces/monitorEvent.js';

const CF_EMAIL = process.env["CF_EMAIL"]
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"]
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"]

export const cfWorkers = new WorkersKv(CF_EMAIL!, CF_ACCOUNT_ID!, CF_GLOBAL_API_KEY!);

export const createTempNamespace = async (namespaceName: string) => {
    return (await cfWorkers.createNamespace({title: namespaceName})).id
}

export const removeTempNamespace = async (namespaceId: string) => {
    await cfWorkers.removeNamespace({namespaceId: namespaceId!})
}

export const genTempDbName = (testName: string) => {
    return `_KvDriverTest_${testName}`
}


export const promisifyMonitorStream = (
    kvMonitor: WorkersKvMonitor, 
    eventType: "success" | "err", 
    timeout: number, 
    dbOperation: {
        func: Function,
        params: Array<any>
    }) => {
    return new Promise<DbEventEmit.ActivityMsg>(async (resolve, reject) => {
        kvMonitor.dbMonitorStream().on(eventType, (msg: DbEventEmit.ActivityMsg)=>{
            setTimeout(()=>{
                reject("Timeout")
            }, timeout);
            resolve(msg);
        })
        try{
            await dbOperation.func(...dbOperation.params);
        } catch {} //It does not matter if the dbOperation throws an exception

    })
}
import test from 'ava'
import { WorkersKv, WorkersKvMonitor } from '../src/index.js'
import { createTempNamespace, removeTempNamespace, genTempDbName, promisifyMonitorStream } from './util.js'

const MONITOR_STREAM_EVENT_EMIT_TIMEOUT_MS = 3000;

const CF_EMAIL = process.env["CF_EMAIL"]
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"]
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"]


const kvMonitor = new WorkersKvMonitor()
const kvWorkers = new WorkersKv(CF_EMAIL!, CF_ACCOUNT_ID!, CF_GLOBAL_API_KEY!, true, kvMonitor.dbListener.bind(kvMonitor));


const namespaceName = genTempDbName("Monitor")
let namespaceId: string | null = null
const keyName = "monitorTestKey"
const writeValue = "abc"

test.before("Create a temp namespace for test purpose", async() => {
    namespaceId = await createTempNamespace(namespaceName)
})
test.serial("Writing a key", async t => {
    t.plan(2);
    const msg = await promisifyMonitorStream(
        kvMonitor, 
        "success", 
        MONITOR_STREAM_EVENT_EMIT_TIMEOUT_MS,
        {
            func: kvWorkers.write.bind(kvWorkers),
            params: [{namespaceId: namespaceId!, keyName: keyName}, writeValue]
        }
    );

    t.deepEqual(msg.action, {
        commandType: "CRUD",
        command: "Write key-value pair",
        input: {
            relativePathParam: {namespaceId: namespaceId, keyName: keyName},
            urlParam: {},
            data: {value: writeValue}
        }
    });

    t.deepEqual(msg.cfResponse.cfRes, {
        success: true,
        errors: [],
        messages: [],
        result: null
    });
})

test.serial("Reading a key", async t => {
    t.plan(2);

    const msg = await promisifyMonitorStream(
        kvMonitor, 
        "success", 
        MONITOR_STREAM_EVENT_EMIT_TIMEOUT_MS,
        {
            func: kvWorkers.read.bind(kvWorkers),
            params: [{namespaceId: namespaceId!, keyName: keyName}]
        }
    );

    t.deepEqual(msg.action, {
        commandType: "CRUD",
        command: "Read key-value pair",
        input: {
            relativePathParam: {namespaceId: namespaceId, keyName: keyName},
            urlParam: null,
            data: null
        }
    })
    t.deepEqual(msg.cfResponse.cfRes, writeValue)    
})

test.serial("Delete a key", async t =>{
    t.plan(2);

    const msg = await promisifyMonitorStream(
        kvMonitor, 
        "success", 
        MONITOR_STREAM_EVENT_EMIT_TIMEOUT_MS,
        {
            func: kvWorkers.delete.bind(kvWorkers),
            params: [{namespaceId: namespaceId!, keyName: keyName}]
        }
    );
    
    t.deepEqual(msg.action, {
        commandType: "CRUD",
        command: "Delete key-value pair",
        input: {
            relativePathParam: {namespaceId: namespaceId, keyName: keyName},
            urlParam: null,
            data: null
        }
    })
    t.deepEqual(msg.cfResponse.cfRes, {
        success: true,
        errors: [],
        messages: [],
        result: null
    })

})

test("Remove a non-existent namespace", async t =>{
    const NON_EXISTENT_NAMESPACE_ID = "abc";
    t.plan(2);

    const msg = await promisifyMonitorStream(
        kvMonitor, 
        "err", 
        MONITOR_STREAM_EVENT_EMIT_TIMEOUT_MS, 
        {
            func: kvWorkers.removeNamespace.bind(kvWorkers), 
            params: [{namespaceId: NON_EXISTENT_NAMESPACE_ID}]
        })

    t.deepEqual(msg!.action, {
        commandType: "namespace",
        command: "Remove a namespace",
        input: {
            relativePathParam: {namespaceId: NON_EXISTENT_NAMESPACE_ID},
            urlParam: null,
            data: null
        }
    })
    t.deepEqual(msg!.cfResponse.cfRes, {
        success: false,
        errors: [
            {
                code: 10011,
                message: 'could not parse UUID from request\'s namespace_id: \'invalid UUID length: 3\'',
            }
        ],
        messages: [],
        result: null
    })

})


test.after("Remove the temp namespace", async() => {
    await removeTempNamespace(namespaceId!)
})



import test from 'ava'
import { WorkersKv, WorkersKvMonitor } from '../src/index.js'
import { createTempNamespace, removeTempNamespace, genTempDbName } from './util.js'

const CF_EMAIL = process.env["CF_EMAIL"]
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"]
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"]


const kvMonitor = new WorkersKvMonitor()
const kvWorkers = new WorkersKv(CF_EMAIL!, CF_ACCOUNT_ID!, CF_GLOBAL_API_KEY!, kvMonitor.dbListener.bind(kvMonitor));


const namespaceName = genTempDbName("Monitor")
let namespaceId: string | null = null
const keyName = "monitorTestKey"
const writeValue = "abc"

test.before("Create a temp namespace for test purpose", async() => {
    namespaceId = await createTempNamespace(namespaceName)
})
test.serial("Writing a key", async t => {
    t.plan(2);
    kvMonitor.dbMonitorStream().on("success", (msg)=>{
        t.deepEqual(msg.action, {
            commandType: "CRUD",
            command: "Write key-value pair",
            input: {
                relativePathParam: {namespaceId: namespaceId, keyName: keyName},
                urlParam: {},
                data: {value: writeValue}
            }
        })
        t.deepEqual(msg.cfResponse.cfRes, {
            success: true,
            errors: [],
            messages: [],
            result: null
        })
    })
    await kvWorkers.write({namespaceId: namespaceId!, keyName: keyName}, writeValue)
})

test.serial("Reading a key", async t => {
    t.plan(2);
    kvMonitor.dbMonitorStream().on("success", (msg)=>{
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
    await kvWorkers.read({namespaceId: namespaceId!, keyName: keyName}) 
})

test.serial("Delete a key", async t =>{
    t.plan(2);
    kvMonitor.dbMonitorStream().on("success", (msg)=>{
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
    await kvWorkers.delete({namespaceId: namespaceId!, keyName: keyName})
})

test("Remove a non-existent namespace", async t =>{
    const nonExistNamespaceId = "abc";
    t.plan(2);

    kvMonitor.dbMonitorStream().on("error", (msg)=>{
        t.deepEqual(msg.action, {
            commandType: "namespace",
            command: "Remove a namespace",
            input: {
                relativePathParam: {namespaceId: nonExistNamespaceId},
                urlParam: null,
                data: null
            }
        })
        t.deepEqual(msg.cfResponse.cfRes, {
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
    
    try {
        await kvWorkers.removeNamespace({namespaceId: nonExistNamespaceId});
    } catch {}

})


test.after("Remove the temp namespace", async() => {
    await removeTempNamespace(namespaceId!)
})



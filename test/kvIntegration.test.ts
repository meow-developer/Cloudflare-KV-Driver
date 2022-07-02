import test from 'ava'
import { WorkersKv } from '../src/index.js'
import { WorkersKvError } from '../src/util.js'
import { createTempNamespace, removeTempNamespace, genTempDbName } from './temp.js'

const CF_EMAIL = process.env["CF_EMAIL"]
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"]
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"]

const cfWorkers = new WorkersKv(CF_EMAIL!, CF_ACCOUNT_ID!, CF_GLOBAL_API_KEY!);


const namespaceTest = () => {
    const namespaceName = genTempDbName(namespaceTest.name)
    let namespaceId: string | null = null

    test.serial("Create a namespace - With legit parameters", async t =>{
        const req = await cfWorkers.createNamespace({title: namespaceName})

        t.deepEqual(Object.keys(req), ["id", "title", "supports_url_encoding"])
        t.is(req["title"], namespaceName)

        namespaceId = req.id
    })

    test.serial("List Namespace - Without parameters", async t => {
        const req = await cfWorkers.listNamespaces()
        let findMatchNamespace = false;
        req.forEach((obj)=>{
            t.deepEqual(Object.keys(obj), ["id", "title", "supports_url_encoding"])
            if (obj["title"] == namespaceName)
                findMatchNamespace = true;
        })
        t.is(findMatchNamespace, true)
    })

    const newNamespaceName = "namespaceTest_db2"

    test.serial("Rename a namespace - With legit namespace Id", async t=>{
        const req = await cfWorkers.renameNamespace({namespaceId: namespaceId!}, {title: newNamespaceName})
        t.is(req, true)
    })
    test.serial("Remove a namespace - With legit namespace", async t => {
        const req = await cfWorkers.removeNamespace({namespaceId: namespaceId!})
        t.is(req, true)
    })

}


const keyValueTest = async () => {
    const namespaceName = genTempDbName(keyValueTest.name)
    let namespaceId: string | null = null

    const keyName = "testing"
    const keyValue = "abc"

    test.before("Create a temp namespace for test purpose", async() => {
        namespaceId = await createTempNamespace(namespaceName)
    })
    test.serial("Write key-value pair", async t => {
        const req = await cfWorkers.write({namespaceId: namespaceId!, keyName}, keyValue)
        t.is(req, true)
    })
    test.serial("Read key-value pair", async t =>{
        const req = await cfWorkers.read({namespaceId: namespaceId!, keyName: keyName})
        t.is(req, keyValue)
        
    })
    test.serial("Delete key-value pair", async t => {
        const req = await cfWorkers.delete({namespaceId: namespaceId!, keyName: keyName})
        t.is(req, true)
        
    })
    test.after("Remove the temp namespace", async() => {
        await removeTempNamespace(namespaceId!)
    })
}

const keyValueWithMetaTest = async() => {
    const namespaceName = genTempDbName(keyValueWithMetaTest.name)
    let namespaceId: string | null = null

    const keyName = "testingWithMeta"
    const keyValue = "abc"
    const metadata = {a: "b"}
    test.before("Create a temp namespace for test purpose", async() => {
        namespaceId = await createTempNamespace(namespaceName)
    })
    test.serial("Write key-value pair with metadata", async t => {
        const req = await cfWorkers.writeKeyValuePairMeta({namespaceId: namespaceId!, keyName: keyName}, {value: keyValue , metadata: metadata})
        t.is(req, true)
    })
    test.serial("Read the metadata for a key", async t => {
        const req = await cfWorkers.readKeyMeta({namespaceId: namespaceId!, keyName: keyName})
        t.deepEqual(req, metadata)
    })
    test.after("Remove the temp namespace", async() => {
        await removeTempNamespace(namespaceId!)
    })
}

const multipleKeyValueTest = async () => {
    const namespaceName = genTempDbName(multipleKeyValueTest.name)
    let namespaceId: string | null = null
    const sampleData = [{key: "test1", value: "test1Value"}, {key: "test2", value: "test2Value"}]
    test.before("Create a temp namespace for test purpose", async() => {
        namespaceId = await createTempNamespace(namespaceName)
    })
    test.serial("Write multiple key-value pairs", async t => {
        const req = await cfWorkers.writeMultipleKeyValuePairs({namespaceId: namespaceId!}, sampleData)
        t.is(req, true)
    })
    let sampleDataKey: Array<string> = []
    sampleData.forEach((obj)=>{sampleDataKey.push(obj.key)})
    test.serial("Delete multiple key-value pairs", async t => {
        const req = await cfWorkers.deleteMultipleKeyValuePairs({namespaceId: namespaceId!}, {keyName: sampleDataKey})
        t.is(req, true)
    })
    test.after("Remove the temp namespace", async() => {
        await removeTempNamespace(namespaceId!)
    })
}

namespaceTest()
keyValueTest()
keyValueWithMetaTest()
multipleKeyValueTest()
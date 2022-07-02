import test from 'ava';
import { WorkersKvError } from '../src/util.js';
import { cfWorkers, createTempNamespace, removeTempNamespace, genTempDbName } from './util.js';
let namespaceId = null;
const createNamespace = () => {
    const namespaceName = genTempDbName(createNamespace.name);
    test("Create a namespace", async (t) => {
        const req = await cfWorkers.createNamespace({ title: namespaceName });
        t.deepEqual(Object.keys(req), ["id", "title", "supports_url_encoding"]);
        namespaceId = req.id;
    });
    test.after("Remove the temp namespace", async () => {
        await removeTempNamespace(namespaceId);
    });
};
const listNamespaces = () => {
    test("List Namespaces - Without URL parameters", async (t) => {
        const req = await cfWorkers.listNamespaces();
        req.forEach((obj) => {
            t.deepEqual(Object.keys(obj), ["id", "title", "supports_url_encoding"]);
        });
    });
    test("List Namespaces - With URL parameters", async (t) => {
        const req = await cfWorkers.listNamespaces({ direction: "asc" });
        req.forEach((obj) => {
            t.deepEqual(Object.keys(obj), ["id", "title", "supports_url_encoding"]);
        });
    });
};
const listNamespaceKeys = () => {
    const namespaceName = genTempDbName(listNamespaceKeys.name);
    let namespaceId = null;
    test.before("Create a temp namespace for test purpose", async () => {
        console.log("Testing Function: listNamespaceKeys");
        namespaceId = await createTempNamespace(namespaceName);
    });
    test("List a namespace's keys - Without URL parameters", async (t) => {
        const req = await cfWorkers.listNamespaceKeys({ namespaceId: namespaceId });
        t.deepEqual(Object.keys(req), ["result", "result_info"]);
        req.result.forEach((obj) => {
            t.is(Object.keys(obj).includes("name"), true);
        });
        t.deepEqual(Object.keys(req.result_info), ["count", "cursor"]);
    });
    test("List a namespace's keys - With URL parameters", async (t) => {
        const req = await cfWorkers.listNamespaceKeys({ namespaceId: namespaceId }, { limit: 50 });
        t.deepEqual(Object.keys(req), ["result", "result_info"]);
        req.result.forEach((obj) => {
            t.is(Object.keys(obj).includes("name"), true);
        });
        t.deepEqual(Object.keys(req.result_info), ["count", "cursor"]);
    });
    test.after("Remove the temp namespace", async () => {
        await removeTempNamespace(namespaceId);
    });
};
const renameNamespace = () => {
    const namespaceName = genTempDbName(renameNamespace.name);
    const namespaceNewName = genTempDbName(renameNamespace.name + "1");
    let namespaceId = null;
    test.before("Create a temp namespace for test purpose", async () => {
        namespaceId = await createTempNamespace(namespaceName);
    });
    test("Rename a namespace - With existed namespace Id", async (t) => {
        const req = await cfWorkers.renameNamespace({ namespaceId: namespaceId }, { title: namespaceNewName });
        t.is(req, true);
    });
    test.after("Remove the temp namespace", async () => {
        await removeTempNamespace(namespaceId);
    });
    test("Rename a namespace - With non existed namespace Id", async (t) => {
        const namespaceId = "bbc"; //A namespace id that is not existed on Cloudflare KV
        await t.throwsAsync(async () => {
            const req = await cfWorkers.renameNamespace({ namespaceId: namespaceId }, { title: namespaceNewName });
        }, { instanceOf: WorkersKvError, name: "Failed to Rename a namespace" });
    });
};
const removeNamespace = () => {
    const namespaceName = genTempDbName(removeNamespace.name);
    let namespaceId = null;
    test.before("Create a temp namespace for test purpose", async () => {
        namespaceId = await createTempNamespace(namespaceName);
    });
    test("Remove a namespace - With existed namespace", async (t) => {
        const req = await cfWorkers.removeNamespace({ namespaceId: namespaceId });
        t.is(req, true);
    });
    test("Remove a namespace - With non existed namespace", async (t) => {
        const namespaceId = "abc"; //A namespace id that is not existed on Cloudflare KV
        await t.throwsAsync(async () => {
            const req = await cfWorkers.removeNamespace({ namespaceId: namespaceId });
        }, { instanceOf: WorkersKvError, name: "Failed to Remove a namespace" });
    });
};
const writeKeyValuePair = () => {
    const namespaceName = genTempDbName(writeKeyValuePair.name);
    let namespaceId = null;
    const keyName = writeKeyValuePair.name;
    const value = "abc";
    test.before("Create a temp namespace for test purpose", async () => {
        namespaceId = await createTempNamespace(namespaceName);
    });
    test("Write data to a key - With no URL params", async (t) => {
        const req = await cfWorkers.writeKeyValuePair({ namespaceId: namespaceId, keyName: keyName }, value);
        t.is(req, true);
    });
    test("Write data to a key - With URL params", async (t) => {
        const req = await cfWorkers.writeKeyValuePair({ namespaceId: namespaceId, keyName: keyName }, value, { expiration_ttl: 300 });
        t.is(req, true);
    });
    test.after("Remove the temp namespace", async () => {
        await removeTempNamespace(namespaceId);
    });
};
const writeMultipleKeyValuePairs = () => {
    const namespaceName = genTempDbName(writeMultipleKeyValuePairs.name);
    let namespaceId = null;
    const data = [{ key: "a", value: "b", expiration_ttl: 300 },
        { key: "b", value: "d", expiration: Math.trunc(Date.now() / 1000 + 300) }];
    test.before("Create a temp namespace for test purpose", async () => {
        namespaceId = await createTempNamespace(namespaceName);
    });
    test("Write data to multiple keys - With optional parameters", async (t) => {
        const req = await cfWorkers.writeMultipleKeyValuePairs({ namespaceId: namespaceId }, data);
        t.is(req, true);
    });
    test.after("Remove the temp namespace", async () => {
        await removeTempNamespace(namespaceId);
    });
};
createNamespace();
removeNamespace();
renameNamespace();
listNamespaces();
writeMultipleKeyValuePairs();

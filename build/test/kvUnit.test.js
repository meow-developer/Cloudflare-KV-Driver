import test from 'ava';
import { WorkersKv } from '../src/index.js';
import { WorkersKvError } from '../src/util.js';
import { createTempNamespace, removeTempNamespace, genTempDbName } from './temp.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
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
createNamespace();
removeNamespace();
renameNamespace();
listNamespaces();

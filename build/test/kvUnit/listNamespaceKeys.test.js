import test from 'ava';
import { WorkersKv } from '../../src/index.js';
import { createTempNamespace, removeTempNamespace } from '../temp.test.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
const namespaceName = "tempDb";
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

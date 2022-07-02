import test from 'ava';
import { WorkersKv } from '../../src/index.js';
import { WorkersKvError } from '../../src/util.js';
import { createTempNamespace, removeTempNamespace } from '../temp.test.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
const namespaceName = "removeNamespace";
let namespaceId = null;
const namespaceNewName = "newNamespaceName";
test.before("Create a temp namespace for test purpose", async () => {
    namespaceId = await createTempNamespace(namespaceName);
});
test("Rename a namespace - With existed namespace Id", async (t) => {
    const namespaceId = "abc";
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

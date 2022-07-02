import test from 'ava';
import { WorkersKv } from '../../src/index.js';
import { WorkersKvError } from '../../src/util.js';
import { createTempNamespace } from '../temp.test.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
const namespaceName = "tempDb";
let namespaceId = null;
test.before("Create a temp namespace for test purpose", async () => {
    console.log("removeNamespace");
    namespaceId = await createTempNamespace(namespaceName);
});
test("Remove a namespace - With existed namespace", async (t) => {
    const namespaceId = "abc";
    const req = await cfWorkers.removeNamespace({ namespaceId: namespaceId });
    t.is(req, true);
});
test("Remove a namespace - With non existed namespace", async (t) => {
    const namespaceId = "abc"; //A namespace id that is not existed on Cloudflare KV
    await t.throwsAsync(async () => {
        const req = await cfWorkers.removeNamespace({ namespaceId: namespaceId });
    }, { instanceOf: WorkersKvError, name: "Failed to Remove a namespace" });
});

import test from 'ava';
import { WorkersKv } from '../../src/index.js';
import { removeTempNamespace } from '../temp.test.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
const namespaceName = "tempDb";
let namespaceId = null;
test("Create a namespace", async (t) => {
    const req = await cfWorkers.createNamespace({ title: namespaceName });
    t.deepEqual(Object.keys(req), ["id", "title", "supports_url_encoding"]);
    namespaceId = req.id;
});
test.after("Remove the temp namespace", async () => {
    await removeTempNamespace(namespaceId);
});

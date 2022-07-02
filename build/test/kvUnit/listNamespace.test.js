import test from 'ava';
import { WorkersKv } from '../../src/index.js';
const CF_EMAIL = process.env["CF_EMAIL"];
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"];
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"];
const cfWorkers = new WorkersKv(CF_EMAIL, CF_ACCOUNT_ID, CF_GLOBAL_API_KEY);
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

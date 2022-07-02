import { WorkersKv } from '../src/index.js'

const CF_EMAIL = process.env["CF_EMAIL"]
const CF_ACCOUNT_ID = process.env["CF_ACCOUNT_ID"]
const CF_GLOBAL_API_KEY = process.env["CF_GLOBAL_API_KEY"]

const cfWorkers = new WorkersKv(CF_EMAIL!, CF_ACCOUNT_ID!, CF_GLOBAL_API_KEY!);

export const createTempNamespace = async (namespaceName: string) => {
    return (await cfWorkers.createNamespace({title: namespaceName})).id
}

export const removeTempNamespace = async (namespaceId: string) => {
    await cfWorkers.removeNamespace({namespaceId: namespaceId!})
}

export const genTempDbName = (testName: string) => {
    return `TestDb_${testName}`
}
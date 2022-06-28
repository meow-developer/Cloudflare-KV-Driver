# Cloudflare-KV-Driver

## Highlights
- Expressive API
- Detailed documentation
- [Built-in monitoring device that monitors database activities](#monitoring-device)
- Includes TypeScript definitions
- Actively maintained

## Installation

```
npm install cloudflare-kv-driver

# or ...

yarn add cloudflare-kv-driver
```

## Quick Start

```js

import { WorkersKv } from  'cloudflare-kv-driver'

const  workersKv  =  new  WorkersKv(
	//The email associated with the Cloudflare account
	process.env["CF_EMAIL"],
	//The ID of the Cloudflare account
	process.env["CF_ACCOUNT_ID"],
	//The global api key that has all the access right to the Cloudflare account
	process.env["CF_GLOBAL_API_KEY"],
)

//Writing data to a key
await workersKv.write({
	namespaceId: "namespaceId",
	keyName: "keyName"
}, "value")
```

## Basic Usage

### List Namespaces

```js
await workersKv.listNamespaces()
```

```js
workersKv.listNamespaces(
	urlParam?: {
		page?: number,
		per_page?: number,
		order?: "id"  |  "title",
		direction?: "asc"  |  "desc"
})
```

### Create a Namespace

```js
await workersKv.createNamespace({title: "Namespace"})
```

### Remove a Namespace

```js
await workersKv.removeNamespace({namespaceId: "namespaceId"})
```

### Rename a Namespace

```js
await workersKv.renameNamespace({namespaceId: "namespaceId"}, 
				{title: "title"})
```

### List a Namespace's Keys

```js
await workersKv.listNamespaceKeys({namespaceId: "namespaceId"})
```

```js
workersKv.listNamespaceKeys(
	relativePathParameter: {
		namespaceId: string
	},
	urlParam?: {
		limit?: number,
		cursor?: string,
		prefix?: string
	}
)
```

### Read key-value pair

```js
await workersKv.readKeyValuePair({
	namespaceId: "namespaceId",
	keyName: "keyName"
})
# or ...
await workersKv.read({
	namespaceId: "namespaceId",
	keyName: "keyName"
})
```

### Read the metadata for a key

```js
await workersKv.readKeyMeta({
	namespaceId: "namespaceId", 
	keyName: "keyName"
})
```

### Write key-value pair

```js
await workersKv.writeKeyValuePair({
	namespaceId: "namespaceId",
	keyName: "keyName"
}, "value")
# or ...
await workersKv.write({
	namespaceId: "namespaceId",
	keyName: "keyName"
}, "value")
```

```js
workersKv.writeKeyValuePair(
	relativePathParameter: {
		namespaceId: string,
		keyName: string
	},
	value: string,
	urlParam?: {
		expiration?: number,
		expiration_ttl?: number
	}
)
```

### Write key-value pair with metadata

```js
await workersKv.writeKeyValuePairMeta({
	namespaceId: "namespaceId",
	keyName: "keyName"
},{
	value: "value",
	metadata: {metadata: "a"}
})
```

```js
workersKv.writeKeyValuePairMeta(
	relativePathParameter: {
		namespaceId: string,
		keyName: string
	},
	data: {
		value: string,
		metadata: { [key: string]: any }
	},
	urlParam?: {
		expiration?: number,
		expiration_ttl?: number
	}
)
```

### Write multiple key-value pairs

```js
const data = [{key: "key1", value: "value1"}, 
			{key: "key2", value: "value2"}]

await workersKv.writeMultipleKeyValuePairs({
            namespaceId: string,
}, data)
```

```js
workersKv.writeMultipleKeyValuePairs(
        relativePathParameter: {
            namespaceId: string,
        },
        data: Array<{
            key: string,
            value: string
            expiration?: number,
            expiration_ttl?: number,
            metadata?: { [key: string]: any },
            base64?: boolean
        }>
    )
```

### Delete key-value pair

```js
await workersKv.deleteKeyValuePair({
	namespaceId: "namespaceId",
	keyName: "namespaceId"
})
# or ...
await workersKv.delete({
	namespaceId: "namespaceId",
	keyName: "namespaceId"
})
```

### Delete multiple key-value pairs

```js
await workersKv.deleteMultipleKeyValuePairs(
	{
            namespaceId: string
        },
        data: {
            keyName: ["key1", "key2"]
        }
)
```

## Monitoring Device

```js
import { WorkersKv, WorkersKvMonitor } from  'cloudflare-kv-driver'

const kvMonitor  = new WorkersKvMonitor(); //The monitoring device
const workersKv  = new WorkersKv(
	process.env["CF_EMAIL"],
	process.env["CF_ACCOUNT_ID"],
	process.env["CF_GLOBAL_API_KEY"],
	kvMonitor.dbListener.bind(kvMonitor) //Binding a database event listener to the driver
)
```
### Properties of  an event message
| Properties | Description |
|--|--|
| timestamp | The time when the operation is executed |
| action | The requested database operation |
| cfResponse | The response from Cloudflare

### Monitoring succeeded events

```js
kvMonitor.dbMonitorStream().on("success", (msg)=>{
	console.log(msg)
})

await workersKv.write({
	namespaceId: "namespaceId",
	keyName: "keyName"
}, "value")
```
**Warning**
The Monitor will only generate messages if it's executed before the database operation function is executed.

### Monitoring failed events
 
 Except for the normal properties listed above, a failed event message also contains the following properties
 
 | Properties | Description |
 | -- | -- |
 | errorDetail | The error that caused the failure |
 
```js
kvMonitor.dbMonitorStream().on("error", (msg)=>{
	console.log(msg)
})
```

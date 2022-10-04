# Cloudflare-KV-Driver

An unofficial Cloudflare Kv Node.js Driver

## Highlights
- Expressive API
- [Detailed documentation](#documentation)
- [Built-in monitoring device that monitors database activities](#monitoring-device)
- Includes TypeScript definitions
- Actively maintained

## Installation

```
npm install cf-kv-driver
```

## Quick Start

```js

import { WorkersKv } from  'cf-kv-driver'

const  workersKv  =  new  WorkersKv(
	//The email associated with the Cloudflare account
	process.env["CF_EMAIL"],
	//The ID of the Cloudflare account
	process.env["CF_ACCOUNT_ID"],
	//The global api key of the Cloudflare account
	process.env["CF_GLOBAL_API_KEY"]
)

//Writing data to a key
await workersKv.write({
	namespaceId: "namespaceId",
	keyName: "keyName"
}, "value")
```

## Basic Usage



### List Namespace's Keys

```js
await workersKv.listNamespaceKeys({namespaceId: "namespaceId"})
```


### Read a key-value pair

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


### Write a key-value pair

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



### Write multiple key-value pairs

```js
const data = [{key: "key1", value: "value1"}, 
		{key: "key2", value: "value2"}]

await workersKv.writeMultipleKeyValuePairs({
            namespaceId: string,
}, data)
```

### Delete a key-value pair

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
## Documentation
A comprehensive documentation is on [https://kv-driver.pages.dev/](https://kv-driver.pages.dev/)


## Monitoring Device

```js
import { WorkersKv, WorkersKvMonitor } from  'cf-kv-driver'

const kvMonitor  = new WorkersKvMonitor(); //The monitoring device
const workersKv  = new WorkersKv(
	process.env["CF_EMAIL"],
	process.env["CF_ACCOUNT_ID"],
	process.env["CF_GLOBAL_API_KEY"],
	true, //Enforcing to do validity check on Cloudflare response
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
**:warning: Warning**
The monitoring device will only generate event messages if it's executed before the database operation function is executed.

### Monitoring failed events
 
 Except for the normal properties listed above, a failed event message also contains the following properties
 
 | Properties | Description |
 | -- | -- |
 | errorDetail | The error that caused the failure |
 
```js
kvMonitor.dbMonitorStream().on("err", (msg)=>{
	console.log(msg)
})
```

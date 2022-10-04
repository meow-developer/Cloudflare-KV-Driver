export namespace WorkersKvInterfaces {
    export interface BridgeCommand {
        commandType: "CRUD" | "namespace" | "other",
        command: string,
        input: {
            relativePathParam: { [key: string]: string } | null,
            data: { [key: string]: any } | null,
            urlParam: { [key: string]: any } | null
        }
    }
}
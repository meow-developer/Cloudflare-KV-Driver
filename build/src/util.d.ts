/**
 * @class
 * @description Customize the style of the message printed in the console
 */
export declare class CustomConsole {
    /**
     * @function warning
     * @description Print the warning message in an eye catching format.
     * @param title - The title of the warning message
     * @param shortDescription - The short description of the warning
     * @param detail - The detail of the warning
     */
    warning(title: string, shortDescription: string, detail: {
        [key: string]: any;
    } | string | null): void;
}
/**
 * @class
 * @description Customize the thrown error class
 */
export declare class WorkersKvError extends Error {
    errDetail: {
        [key: string]: any;
    } | null;
    /**
     *
     * @param title - The title of the error
     * @param msg - The short description of the error
     * @param errDetail - The detail of the error
     * @param params - The extra information of the error
     */
    constructor(title: string, msg: string, errDetail: {
        [key: string]: any;
    } | null);
}

/** Downloaded Modules */
import chalk from 'chalk';

/**
 * Customize the style of a message that wants to be printed in the console
 * @class
 */
export class CustomConsole{
    /**
     * Printing the warning message in an eye catching format.
     * @function warning
     * @param title The title of the warning message
     * @param shortDescription The short description of the warning 
     * @param detail The detail of the warning
     */
    warning(
        title: string,
        shortDescription: string,
        detail: { [key: string]: any } | string | null
    ){
        console.warn(chalk.bgYellow.bold( " Warning " ) + " " + title,
                        "\n" + shortDescription,
                        "\n" + detail);
    }

}

/**
 * Customize an error class specifically for WorkerKv Driver
 * @class
 */
 export class WorkersKvError extends Error {
    errDetail: {[key: string]: any} | null;
    /**
     * @constructor
     * @param title The title of the error 
     * @param msg The short description of the error
     * @param errDetail The detail of the error
     * @param params The extra information of the error
     */
    constructor(title: string, msg: string, errDetail: {[key: string]: any} | null) {
        super(msg)
        this.name = title;
        this.errDetail = errDetail;
    }
}

#!/usr/bin/env node

import os from "os";
import { exec } from "child_process";
import { runCli } from "./cli.js";
import { __dirname } from "./global.js";

const checkPrivilege = () => {
    return new Promise((resolve, reject) => {
        const command = "net session";

        exec(command, (err, stdout) => {
            if (
                err ||
                !(stdout.indexOf("There are no entries in the list.") > -1)
            ) {
                reject("Run command as administrator");
                return;
            }
            resolve("");
        });
    });
}

const checkOS = () => {
    if (os.platform() !== "win32") {
        console.error("Windows supported only!");
        process.exit();
    }
}

;(async function () {
    process.title = "setdns";

    checkOS();
    try {
        await checkPrivilege();
    } catch(err) {
        console.log(err);
        process.exit();
    }
    await runCli();
})();

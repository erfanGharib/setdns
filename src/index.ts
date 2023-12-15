#!/usr/bin/env node

import os from "os";
import { exec } from "child_process";
import { runCli } from "./cli.js";
import { __dirname } from "./global.js";

const checkPrivilege = () => {
    new Promise((resolve) => {
        const command = "net session";

        exec(command, (err, stdout) => {
            if (
                err ||
                !(stdout.indexOf("There are no entries in the list.") > -1)
            ) {
                console.log("Run command as administrator");
                process.exit(1);
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

;(function () {
    process.title = "setdns";

    checkOS();
    checkPrivilege();
    runCli();
})();

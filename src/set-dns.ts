import fs from "fs";
import { ipRegex, savedDnssPath } from "./global.js";
import { exec } from "child_process";

type T_Dns = {
    [key: string]: string[],
}

class SetDns {
    private allDnss: T_Dns = {};
    countRun: number;

    constructor() {
        this.countRun = 0;
    }

    async getNetInterfaces(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            exec('ipconfig /all', (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(err || stderr);
                }

                const netInterfaces = (
                    stdout
                        .split('\n')
                        .filter(v => v.includes(':\r'))
                        .map(v =>
                            v
                            .substring(0, v.length - 2)
                            .substring(v.indexOf(' ', 9)+1, v.length)
                        )
                );

                resolve(netInterfaces)
            });
        });
    }

    countDnss(netInterface: string): Promise<number> {
        const command = `netsh interface ipv4 show dnsservers "${netInterface}"`;

        return new Promise((resolve) => {
            exec(command, (error, stdout) => {
                const dnss = stdout.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? [];
                resolve(dnss.length);
            })
        })
    }

    add(dnsName: string, dnss: string) {
        const _dnss = dnss.split(',').map(v => v.trim());

        if(!_dnss.every(v => v.match(ipRegex))) {
            console.error('Invalid Ip Addresses\n');
            return false;
        }

        this.allDnss = this.readFile();
        this.allDnss[dnsName] = _dnss;
        this.writeFile();

        return true;
    }

    remove(dnsName: string) {
        this.allDnss = this.readFile();
        delete this.allDnss[dnsName];
        this.writeFile();
    }

    async clearDnss(netInterface: string) {
        const command = `netsh interface ipv4 delete dnsservers name="${netInterface}" all`;

        return new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if(err || stderr) {
                    reject('Failed to clear dns!');
                    process.exit(1);
                }
                resolve('Dns cleared successfully!');
            })
        })
    }

    async set(dnsName: string, netInterface: string) {
        this.allDnss = this.readFile();
        
        const _this = this;
        const whichDns = this.allDnss[dnsName];

        if(!whichDns) {
            return console.error(`Invalid Dns \`${whichDns}\`.`);
        }

        if(!netInterface) {
            return console.error(`Invalid Network Interface \`${netInterface}\`.`);
        }
        return new Promise((resolve, reject) => {
            whichDns?.forEach((DNS, index) => {
                const command = `netsh interface ipv4 ${index === 0 ? 'set' : 'add'} dnsserver name="${netInterface}" ${index === 0 ? `static ${DNS} primary` : `addr=${DNS} index=${index+1}`}`;
                
                exec(command, async () => {
                    if(await _this.countDnss(netInterface) !== whichDns.length && _this.countRun <= 4) {
                        console.log('Failed to Set DNS. Retrying..');
                        
                        _this.countRun++;
                        return _this.set(dnsName, netInterface);
                    }

                    resolve('\nDns set successfully!');
                })
            });
        })
    }

    readFile(): T_Dns {
        if(!fs.existsSync(savedDnssPath)) {
            this.writeFile();
        }

        return JSON.parse(fs.readFileSync(savedDnssPath).toString());
    }

    writeFile() {
        fs.writeFileSync(
            savedDnssPath,
            JSON.stringify(this.allDnss)
        )
    }
}

export default SetDns;
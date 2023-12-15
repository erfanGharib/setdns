import fs from "fs";
import { savedDnssPath } from "./global.js";
import { exec } from "child_process";

type T_Dns = {
    name: string,
    dnss: string[],
}

class SetDns {
    private allDnss: T_Dns[] = [];

    constructor() {}

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
    
    add(dnsName: string, dnss: string) {
        const _dnss = dnss.split(',').map(v => v.trim());

        if(!_dnss.every(v => v.match(/^(\d{1,3}\.){3}\d{1,3}$/))) {
            console.error('Invalid Ip Addresses\n');
            return false;
        }

        this.allDnss = this.readFile();
        this.allDnss.push({ name: dnsName, dnss: _dnss });
        this.writeFile();

        return true;
    }
    async clearDnss(netInterface: string) {
        const command = `netsh interface ipv4 delete dnsservers name="${netInterface}" all`;

        return new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if(err || stderr) {
                    console.error(err || stderr);
                    reject('Failed to clear dns!');
                    process.exit(1);
                }
                resolve('Dns cleared successfully!');
            })
        })
    }
    async set(dnsName: string, netInterface: string) {
        this.allDnss = this.readFile();

        const whichDns = this.allDnss.filter(v => v.name === dnsName)?.[0];
        const whichNetInterface = (await this.getNetInterfaces()).filter(v => v === netInterface)?.[0];

        if(!whichDns) {
            return console.error(`Invalid Dns \`${whichDns}\`.`);
        }

        if(!whichNetInterface) {
            return console.error(`Invalid Network Interface \`${whichNetInterface}\`.`);
        }

        return new Promise((resolve, reject) => {
            whichDns?.dnss.forEach((DNS, index) => {
                const command = `netsh interface ipv4 ${index === 0 ? 'set' : 'add'} dnsserver name="${whichNetInterface}" ${index === 0 ? `static ${DNS} primary` : `addr=${DNS} index=${index+1}`}`;

                exec(command, (err, stdout, stderr) => {
                    if(err || stderr) {
                        console.error(err || stderr);
                        reject('Failed to set dns!');
                        process.exit(1);
                    }

                    resolve('\nDns set successfully!');
                })
            });
        })
    }
    readFile() {
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
import inquirer from "inquirer";
import SetDns from "./set-dns.js";
import { cliCommandNames, ipRegex } from "./global.js";

class Commands {
    private setdns: SetDns;

    constructor(setdns: SetDns) {
        this.setdns = setdns;
    }
    
    chooseNetInterface = async (): Promise<{ chosenNetInterface: string }> => {
        return inquirer.prompt([{
            type: "list",
            name: "chosenNetInterface",
            message: "Choose Network Interface for Setting DNS:",
            choices: await this.setdns.getNetInterfaces(),
        }]);
    }

    chooseDns = async (
        options?:
        { label?: string, isCliChoicesIncluded?: boolean }
    ): Promise<{ chosenDns: string }> => {
        const { label, isCliChoicesIncluded = true } = options ?? {};
        const dnss = Object.keys(this.setdns.readFile());

        if(dnss.length <= 0) {
            delete cliCommandNames.EDIT;
            delete cliCommandNames.REMOVE;
        }

        const includedCliChoices = isCliChoicesIncluded 
            ? [new inquirer.Separator(), ...Object.values(cliCommandNames)] 
            : [];

        return inquirer.prompt([{
            type: "list",
            name: "chosenDns",
            message: label ?? "Choose DNS to Set:",
            choices: [
                ...dnss, 
                ...includedCliChoices
            ]
        }])
    }

    enterDnsName = async (): Promise<{ dnsName: string }> => {
        return inquirer.prompt([{
            type: "input",
            name: "dnsName",
            message: "Enter DNS Name:",
        }])
    }

    enterDnss = async (options?: { label: string }): Promise<{ dnss: string }> => {
        const { label } = options ?? {};

        return inquirer.prompt([{
            type: "input",
            name: "dnss",

            validate(input) {
                const hasDuplicates = (array) => {
                    return (new Set(array)).size !== array.length;
                }                
                const _dnss = input.split(',').map(v => v.trim());
        
                if(!_dnss.every(v => v.match(ipRegex))) {
                    return `Invalid DNSs: ${input}`;
                }

                if(hasDuplicates(_dnss)) {
                    return `Duplicate DNSs: ${input}`;
                }

                return true;
            },
            message: label ?? "Enter DNSs Separated with Comma (example: 1.1.1.1, 8.8.8.8):",
        }])
    }
    
    addNewDns = (
        options?: 
        { _dnsName?: string, message?: (dnsName: string) => string, label: string }
    ): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            const { _dnsName, label, message } = options ?? {};
            const dnsName  = _dnsName ?? (await this.enterDnsName()).dnsName;
            const dnss     = (await this.enterDnss({ label })).dnss;
    
            if(this.setdns.add(dnsName, dnss)) {
                message ? console.log(message(dnsName)) : null;
                resolve(dnsName);
                return;
            }
    
            this.addNewDns();
        })
    }
}

export const runCli = async () => {
    console.log('\x1b[1mNotice: Adding dns with same name get replaced\x1b[0m');
    console.log('Exit Program at any time by pressing `ctrl + c`\n');
    
    const setdns = new SetDns();
    const commands = new Commands(setdns);

    const { chosenNetInterface } = await commands.chooseNetInterface();

    const ask = async () => {
        const { chosenDns } = await commands.chooseDns();
    
        switch (chosenDns) {
            case cliCommandNames.ADD_NEW:
                const addedDns = await commands.addNewDns();

                setTimeout(() => {
                    setdns.set(addedDns, chosenNetInterface)
                    .then((msg) => console.log(msg))
                    .catch((err) => console.log(err));
                    
                }, 100);
                
                break;
    
            case cliCommandNames.REMOVE: {
                const { chosenDns } = await commands.chooseDns({ 
                    label: "Choose DNS to Remove:",
                    isCliChoicesIncluded: false
                });
    
                setdns.remove(chosenDns)
                console.log(`\n${chosenDns} DNS removed Successfully\n`)
    
                ask();
    
                break;
            }
    
            case cliCommandNames.EDIT: {
                const { chosenDns } = await commands.chooseDns({ 
                    label: "Choose DNS to Edit:",
                    isCliChoicesIncluded: false
                });
                const dnss = setdns.readFile()[chosenDns].join(', ');
    
                await commands.addNewDns({
                    _dnsName: chosenDns,
                    label: `Enter DNSs Separated with Comma. (Current: ${dnss}):`,
                    message(dnsName) {
                        return `\n${dnsName} DNS Edited Successfully\n`;
                    }
                });
    
                ask();
    
                break;
            }
        
            default:
                setdns.set(chosenDns, chosenNetInterface)
                .then((msg) => console.log(msg))
                .catch((err) => console.log(err));
    
                break;
        }
    }

    ask();
}
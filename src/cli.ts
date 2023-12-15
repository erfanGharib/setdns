import inquirer from "inquirer";
import SetDns from "./set-dns.js";
import { ADD_NEW } from "./global.js";

export const runCli = async () => {
    const setdns = new SetDns();

    const { inputNetInterface, chosenDns } = 
        await inquirer.prompt([
            {
                type: "list",
                name: "inputNetInterface",
                message: "Choose Network Interface for Setting DNS:",
                choices: await setdns.getNetInterfaces(),
            },
            {
                type: "list",
                name: "chosenDns",
                message: "Choose DNS:",
                choices: [...setdns.readFile(), ADD_NEW],
            },
        ])
        
    const addNewDnsCommand = async () => {
        const { dnsName, dnss } = 
            await inquirer.prompt([
                {
                    type: "input",
                    name: "dnsName",
                    message: "Enter DNS Name:",
                },
                {
                    type: "input",
                    name: "dnss",
                    message: "Enter DNSs Separated with Comma (example: 1.1.1.1, 8.8.8.8):",
                },
            ])

        if(setdns.add(dnsName, dnss)) {
            setdns.set(dnsName, inputNetInterface);
            console.log('Successful');
            return;
        } 
        
        addNewDnsCommand();
    }

    if (chosenDns === ADD_NEW) {
        addNewDnsCommand()
    } 
    else {
        setdns.set(chosenDns, inputNetInterface);
        console.log('Successful');
    }
}
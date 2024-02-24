import path from "path";
import { fileURLToPath } from "url";

const __dirname = process.env.NODE_ENV === 'production' 
    ? path.dirname(fileURLToPath(import.meta.url)) 
    : path.join(process.env.APPDATA, 'npm', 'node_modules', 'setdns');

const savedDnssPath = path.join(__dirname, 'dist', 'saved-dns.json');
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

const cliCommandNames = {
    ADD_NEW: '+ Add new DNS',
    REMOVE: '- Remove DNS',
    EDIT: '& Edit DNS',
}
    
export {
    __dirname,
    savedDnssPath,
    ipRegex,
    cliCommandNames,
}
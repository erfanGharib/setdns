import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADD_NEW = '+ Add new DNS';
const savedDnssPath = path.join(process.cwd(), 'dist', 'savedDns.json');

export {
    __dirname,
    ADD_NEW,
    savedDnssPath
}


import fs from 'fs';
import files, {getAbsolutePath} from "./files.js";
/*
 * @returns {boolean | string}

 */
export function onlyStringsAndNumbersValidator(value) {
    const isValid = /^[a-zA-Z0-9]*$/.test(value);
    if(!isValid){
        return "Only strings and numbers are allowed"
    }
    return true;
}
/*
 * @returns {boolean | string}

 */
export function onlyStringsAndNumbersAndDotValidator(value) {
    const isValid = /^[a-zA-Z0-9.]*$/.test(value);
    if(!isValid){
        return "Only strings and numbers and dots are allowed"
    }
    return true;
}
/*
 * @returns {boolean | string}

 */
export function fileExistsValidator(value) {
    const isValid = fs.existsSync(getAbsolutePath(value));
    if(!isValid){
        return "Invalid file path " + value;
    }
    return true;
}
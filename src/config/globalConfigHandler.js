import path from "path";
import os from "os";
import {getProcessedCommandLineParameters} from "../shared/input_arg_processor.js";
import {toJson} from "../shared/utils.js";
import chalk from "chalk";
import inquirerService from "../shared/inquirerService.js";
import fileService from "../shared/files.js";
import logger from "../shared/logger.js";

import * as fs from "fs";

function changeDefaultValue(contents, input) {
const    [key, value] =input
    if (contents.hasOwnProperty(key)) {
        value["default"] = contents[key]
    }
    return [key, value]
}

export function changeDefaultValueWithStoredValue(options,contents) {
    return Object.entries(options)
        .map(input => changeDefaultValue(contents, input))
        .reduce(toJson, {});
}

export async function handleInitConfig(processArgs){
    logger.debug(chalk.greenBright("Initializing Configuration"))
    logger.debug(processArgs)
     const contents = await getGlobalConfig()
    const updatedOptions = changeDefaultValueWithStoredValue(contents);

    const inputs = await getProcessedCommandLineParameters(processArgs,updatedOptions);
    // console.log(inputs)
    await  saveDeployGateConfig(inputs)
    console.log(chalk.greenBright("Configuration Saved in "+ CONFIG_PATH))
}


//
// // Save configuration to a file
// export async function saveDeployGateConfig(inputs) {
// await    fileService.writeFile(CONFIG_PATH, JSON.stringify(inputs, null, 2))
//
// }

// Load configuration from a file
/**
 *
 * @returns {Promise<{
 * ansibleHostName:string,
 * k8sServerUrl:string,
 * kubeNamespace:string,
 * topLevelDomainName:string,
 * registryUrl:string,
 * registryUsername:string,
 * registryPassword:string
 * }>}
 */
export async function getGlobalConfig() {


    const contents = await fileService.getFileContentOrEmpty(getDefaultProfileFile())
    if (contents.length > 0) {

        return JSON.parse(contents);
    }
    return {}

}

export async function getGlobalConfigForProfile(profileName) {


    const contents = await fileService.getFileContentOrEmpty(getFileForProfile(profileName))
    if (contents.length > 0) {

        return JSON.parse(contents);
    }
    return {}

}




export async function handleRemoveGlobalConfig(processArgs){
    if(fileService.fileExists(CONFIG_PATH) === false){
        console.log(chalk.yellowBright("Config File already deleted or not present."))
        return
    }
    const result  = await  inquirerService.confirmAction("Are you sure you want to delete the configuration?")
    if(result){
        await fileService.deleteFile(CONFIG_PATH)
        console.log(chalk.redBright("Configuration Deleted"))
    }

}

export function getFileForProfile(profileName) {
    return path.join(os.homedir(), `deploygateconfig-${profileName}.json`);

}
export function getAllProfileNames() {
    const directoryPath = os.homedir();
    const files = fs.readdirSync(directoryPath);
    const profileFiles = files.filter(file => file.startsWith('deploygateconfig-') && file.endsWith('.json'));
    const profileNames = profileFiles.map(file => file.replace('deploygateconfig-', '').replace('.json', ''));
    return profileNames;
}

export function profileNameDoesNotExistsValidator(value) {

    const filename = getFileForProfile(value);

    if(fileService.fileExists(filename)){
        return "Profile already exists"
    }

    return true;
}
export function profileNameExistsValidator(value) {

    const filename = getFileForProfile(value);

    if(fileService.fileExists(filename)){
        return true;
    }
    return "Profile does not  exists"

}

export function getDefaultProfileFile() {
    return path.join(os.homedir(), 'deploygateconfig.json');
}


export async function saveDeployGateConfigForProfile(profileName,inputs) {
    await    fileService.writeFile(getFileForProfile(profileName), JSON.stringify(inputs, null, 2))

}

export async function saveDefaultDeployGateConfig(inputs) {
    await    fileService.writeFile(getDefaultProfileFile(), JSON.stringify(inputs, null, 2))

}
export function globalConfigExists() {
    return fileService.fileExists(getDefaultProfileFile())
}


export default {
    /**
     * @see getGlobalConfig
     */
    getGlobalConfig:getGlobalConfig,
    globalConfigExists:globalConfigExists
}
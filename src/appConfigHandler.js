
import fs from 'fs';
import path from "path";
import os from "os";
import {getParametersBasedOnOptions} from "./shared/input_arg_processor.js";
import {toJson} from "./shared/utils.js";
import chalk from "chalk";
import inquirerService from "./shared/inquirerService.js";
import fileService from "./shared/files.js";

export const CONFIG_PATH = path.join(os.homedir(), 'deploygateconfig.json');
const options = {
    kubeConfigPath: {
        message: 'Kube Config Path?',
        name: 'kubeConfigPath',
        demandOption: true,
        describe: 'Kube Config Path',
        type: 'string',
        default: "",
    },
    remoteServerAlias: {
        // inquirer
        message: 'Name of remote Server Alias?',
        name: 'remoteServerAlias',
        // yargs
        demandOption: true,
        describe: 'Name of the remoteServerAlias',
        // shared
        type: 'string',
        default: 'user@somedomain.com',
    },
    ansibleHostName: {
        // inquirer
        message: 'Name of the Ansible Host?',
        name: 'ansibleHostName',
        // yargs
        demandOption: true,
        describe: 'Name of the Ansible Host?',
        // shared
        type: 'string',
        default: "somedomain.com",
    },
    customRegistryUrl: {
        // inquirer
        message: 'Custom Registry Url?',
        name: 'customRegistryUrl',
        // yargs
        demandOption: true,
        describe: 'Custom Registry Url',
        // shared
        type: 'string',
        default: "registry.somedomain.com",
    },
    customRegistryCredentialsName: {

        message: 'Custom Registry Credentials Name(stored in Kubernetes)?',
        name: 'customRegistryCredentialsName',
        demandOption: true,
        describe: 'Custom Registry Credentials Name',
        type: 'string',
        default: "registry-credentials",
    },
    kubeNamespace: {

        message: 'Kubernetes Namespace ?',
        name: 'kubeNamespace',
        demandOption: true,
        describe: 'Kubernetes Namespace',
        type: 'string',
        default: "default",
    }

};


function changeDefaultValue(contents, input) {
const    [key, value] =input
    if (contents.hasOwnProperty(key)) {
        value["default"] = contents[key]
    }
    return [key, value]
}

export async function handleInitConfig(processArgs){
     const contents = await loadDeployGateConfig()

    const updatedOptions= Object.entries(options)
        .map(input =>  changeDefaultValue(contents, input))
        .reduce(toJson, {});

    const inputs = await getParametersBasedOnOptions(processArgs,updatedOptions);
    // console.log(inputs)
    await  saveDeployGateConfig(inputs)
    console.log(chalk.greenBright("Configuration Saved in "+ CONFIG_PATH))
}

// Save configuration to a file
export async function saveDeployGateConfig(inputs) {
await    fileService.writeFile(CONFIG_PATH, JSON.stringify(inputs, null, 2))
    // fs.writeFileSync(CONFIG_PATH, JSON.stringify(inputs, null, 2));
}

// Load configuration from a file
/**
 *
 * @returns {Promise<{
 * remoteServerAlias:string,
 * ansibleHostName:string,
 * customRegistryUrl:string,
 * customRegistryCredentialsName:string,
 * kubeNamespace:string,
 * kubeConfigPath:string
 * }>}
 */
export async function loadDeployGateConfig() {




    const contents = await fileService.getFileContentOrEmpty(CONFIG_PATH)
    if (contents.length > 0) {

        return JSON.parse(contents);
    }
    return {}

}

export function appConfigExists() {
    return fileService.fileExists(CONFIG_PATH)
}


export async function handleRemoveConfig(processArgs){
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

export default {
    loadDeployGateConfig:loadDeployGateConfig,
}
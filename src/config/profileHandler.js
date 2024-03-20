import path from "path";
import os from "os";
import input_arg_processor, {getProcessedCommandLineParameters} from "../shared/input_arg_processor.js";
import {toJson} from "../shared/utils.js";
import chalk from "chalk";
import inquirerService from "../shared/inquirerService.js";
import fileService from "../shared/files.js";
import logger from "../shared/logger.js";
import {onlyStringsAndNumbersValidator} from "../shared/validator.js";
import {
    changeDefaultValueWithStoredValue, getAllProfileNames, getDefaultProfileFile,
    getFileForProfile, getGlobalConfigForProfile,
    profileNameDoesNotExistsValidator, profileNameExistsValidator,
    saveDefaultDeployGateConfig,
    saveDeployGateConfigForProfile
} from "./globalConfigHandler.js";
import {createDomainOptions} from "../domain/domainCreateHandler.js";

// export const CONFIG_PATH = path.join(os.homedir(), 'deploygateconfig.json');



export const createProfileOptions = {
    profileName: {
        // inquirer
        message: 'Name of the Profile?',
        name: 'profileName',
        // yargs
        demandOption: true,
        describe: 'Name of the Profile?',
        // shared
        type: 'string',
        default: "dev",
        validate:null
    },
    setProfileAsDefault: {
        // inquirer
        message: 'Set profile as default?',
        name: 'setProfileAsDefault',
        // yargs
        demandOption: true,
        describe: 'Set profile as default?',
        // shared
        type: 'boolean',
        default: true

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
    k8sServerUrl: {
        message: 'Kubernetes Server Url?',
        name: 'k8sServerUrl',
        demandOption: true,
        describe: 'Kubernetes Server Url',
        type: 'string',
        default: "",
    },
    kubeNamespace: {

        message: 'Kubernetes Namespace ?',
        name: 'kubeNamespace',
        demandOption: true,
        describe: 'Kubernetes Namespace',
        type: 'string',
        default: "default",
    },
    topLevelDomainName: {
        // inquirer
        message: 'Top level Domain Name?',
        name: 'topLevelDomainName',
        // yargs
        demandOption: true,
        describe: 'Top level Domain Name?',
        // shared
        type: 'string',
        default: 'example.com',
    },

    registryUrl: {
        // inquirer
        message: 'Container Registry Url?',
        name: 'registryUrl',
        // yargs
        demandOption: true,
        describe: 'Custom Registry Url',
        // shared
        type: 'string',
        default: "registry.somedomain.com",
    },
    registryUsername: {

        message: 'Container Registry Username?',
        name: 'registryUsername',
        demandOption: true,
        describe: 'Container Registry Username Name',
        type: 'string',
        default: "docker",
    },
    registryPassword: {

        message: 'Container Registry Password?',
        name: 'registryPassword',
        demandOption: true,
        describe: 'Container Registry Password',
        type: 'string',
        default: "docker",
    },


};


export const profileNameOptions = {
    profileName: {
        // inquirer
        message: 'Name of the Profile?',
        name: 'profileName',
        // yargs
        demandOption: true,
        describe: 'Name of the Profile?',
        // shared
        type: 'string',
        choices: ['tail', 'export'],
        default: 'tail',
        validate: profileNameExistsValidator
    },
}

// updateProfileOptions.domainName.default = options.appName.default + ".com";
export const updateProfileOptions = {
    setProfileAsDefault: {
        // inquirer
        message: 'Set profile as default?',
        name: 'setProfileAsDefault',
        // yargs
        demandOption: true,
        describe: 'Set profile as default?',
        // shared
        type: 'boolean',
        default: true,
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
    k8sServerUrl: {
        message: 'Kubernetes Server Url?',
        name: 'k8sServerUrl',
        demandOption: true,
        describe: 'Kubernetes Server Url',
        type: 'string',
        default: "",
    },
    kubeNamespace: {

        message: 'Kubernetes Namespace ?',
        name: 'kubeNamespace',
        demandOption: true,
        describe: 'Kubernetes Namespace',
        type: 'string',
        default: "default",
    },
    topLevelDomainName: {
        // inquirer
        message: 'Top level Domain Name?',
        name: 'topLevelDomainName',
        // yargs
        demandOption: true,
        describe: 'Top level Domain Name?',
        // shared
        type: 'string',
        default: 'example.com',
    },

    registryUrl: {
        // inquirer
        message: 'Custom Registry Url?',
        name: 'registryUrl',
        // yargs
        demandOption: true,
        describe: 'Custom Registry Url',
        // shared
        type: 'string',
        default: "registry.somedomain.com",
    },
    registryUsername: {

        message: 'Custom Registry Username?',
        name: 'registryUsername',
        demandOption: true,
        describe: 'Custom Registry Username Name',
        type: 'string',
        default: "docker",
    },
    registryPassword: {

        message: 'Custom Registry Password?',
        name: 'registryUsername',
        demandOption: true,
        describe: 'Custom Registry Password',
        type: 'string',
        default: "docker",
    },


};






export async function handleCreateProfile(processArgs){
    logger.debug(chalk.greenBright("Initializing handleCreateProfile"))
    logger.debug(processArgs)
    createProfileOptions.profileName.validate = profileNameDoesNotExistsValidator

    const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs,createProfileOptions);


    const {profileName,setProfileAsDefault} =inputs

    // console.log(inputs)
    await  saveDeployGateConfigForProfile(profileName,inputs)

    if(setProfileAsDefault){
        await saveDefaultDeployGateConfig(inputs)
    }
    console.log(chalk.greenBright("Configuration Saved in "+ getFileForProfile(profileName)))
}


export async function handleUpdateProfile(processArgs){
    logger.debug(chalk.greenBright("Initializing handleUpdateProfile "))
    logger.debug(processArgs)
    const allProfileNames = getAllProfileNames();
    if (allProfileNames.length === 0) {
        console.log(chalk.yellowBright("No Profile to Update"))
        return
    }
    profileNameOptions.profileName.choices= allProfileNames
    profileNameOptions.profileName.default = profileNameOptions.profileName.choices[0]
    const profileNameInputs =  await input_arg_processor.getProcessedCommandLineParameters(processArgs,profileNameOptions);

    console.log(profileNameInputs)

     const contents = await getGlobalConfigForProfile(profileNameInputs.profileName)
    const updatedOptions = changeDefaultValueWithStoredValue(updateProfileOptions,contents);
    //
    const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs,updatedOptions);
    const {profileName,setProfileAsDefault} =inputs

    // console.log(inputs)
    await  saveDeployGateConfigForProfile(profileName,inputs)

    if(setProfileAsDefault){
        await saveDefaultDeployGateConfig(inputs)
    }
    console.log(chalk.greenBright("Configuration Saved in "+ getFileForProfile(profileName)))
}

export async function handleDeleteProfile(processArgs){
    logger.debug(chalk.greenBright("Initializing handleUpdateProfile "))
    logger.debug(processArgs)

    const allProfileNames = getAllProfileNames();
    if (allProfileNames.length === 0) {
        console.log(chalk.yellowBright("No Profile to delete"))
        return
    }
    profileNameOptions.profileName.choices= allProfileNames
    profileNameOptions.profileName.default = profileNameOptions.profileName.choices[0]
    const profileNameInputs =  await input_arg_processor.getProcessedCommandLineParameters(processArgs,profileNameOptions);


    await fileService.deleteFile(getFileForProfile(profileNameInputs.profileName))
    const globalConfig = await getGlobalConfig();

    if(globalConfig.defaultProfile === profileNameInputs.profileName){


            await fileService.deleteFile(getDefaultProfileFile())
    }

    console.log(chalk.greenBright("Profile Deleted"))

}




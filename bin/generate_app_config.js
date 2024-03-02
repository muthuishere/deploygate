#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as appConfigHandler from "../src/appConfigHandler.js";
import {handleCreateDomain} from "../src/domainHandler.js";
import chalk from "chalk";
import {handleCreateSecrets} from "../src/k8s/secretHandler.js";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleGenerateK8sAppConfig} from "../src/k8s/k8sHandler.js";

// Handle the create-domain command
// {appName,appImageUrl,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL}
const secretOptions= {

    appName: {
        // inquirer
        message: 'Name of  App?',
        name: 'appName',
        // yargs
        demandOption: true,
        describe: 'Name of the App',
        // shared
        type: 'string',
        default: '',
    },
    appImageUrl: {
        // inquirer
        message: 'Container Image URL?',
        name: 'appImageUrl',
        // yargs
        demandOption: true,
        describe: 'Container Image URL',
        // shared
        type: 'string',
        default: '',
    },
    appPort: {
        // inquirer
        message: 'Container Port?',
        name: 'appPort',
        // yargs
        demandOption: true,
        describe: 'Container Port',
        // shared
        type: 'number',
        default: 80,
    },
    exposedPort: {
        // inquirer
        message: 'Exposed Port?',
        name: 'exposedPort',
        // yargs
        demandOption: true,
        describe: 'Exposed Port',
        // shared
        type: 'number',
        default: 80,
    },
    envFilePath: {
        // inquirer
        message: 'Path of the env file?',
        name: 'envFilePath',
        // yargs
        demandOption: true,
        describe: 'Path of the env file',
        // shared
        type: 'string',
        default: '.env.example',
    },
    replicas: {
        // inquirer
        message: 'Replicas?',
        name: 'replicas',
        // yargs
        demandOption: true,
        describe: 'Replicas',
        // shared
        type: 'number',
        default: 1,
    },
    deliveryFolder: {
        // inquirer
        message: 'Where should I Generate the Files?',
        name: 'deliveryFolder',
        // yargs
        demandOption: true,
        describe: 'Delivery Folder',
        // shared
        type: 'string',
        default: 'dist',
    },
    domainName: {
        // inquirer
        message: 'Name of Domain?',
        name: 'domainName',
        // yargs
        demandOption: true,
        describe: 'Name of the domain',
        // shared
        type: 'string',
        default: 'test.somedomain.com',
    },
    enableSSL: {
        // inquirer
        message: 'Should Enable SSL for domain?',
        name: 'enableSSL',
        // yargs
        demandOption: true,
        describe: 'Enable SSL',
        // shared
        type: 'boolean',
        default: true,
    },


};

(async () => {


    try {

        const processArgs = process.argv;

        if(appConfigHandler.appConfigExists() === false){
            console.log('App Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getParametersBasedOnOptions(processArgs,secretOptions);
        await   handleGenerateK8sAppConfig(inputs)

        console.log(chalk.green("Successfully pushed Image to registry"));

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error Creating Domain"), err);
        // console.error(err);
        process.exit(1);
    }

})();

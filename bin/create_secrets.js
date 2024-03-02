#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as appConfigHandler from "../src/appConfigHandler.js";
import {handleCreateDomain} from "../src/domainHandler.js";
import chalk from "chalk";
import {handleCreateSecrets} from "../src/k8s/secretHandler.js";
import input_arg_processor from "../src/shared/input_arg_processor.js";

// Handle the create-domain command
const secretOptions= {

    appName: {
        // inquirer
        message: 'Name of  Secret Group?',
        name: 'appName',
        // yargs
        demandOption: true,
        describe: 'Name of the Secret Group to be created',
        // shared
        type: 'string',
        default: '',
    },
    filePath: {
        // inquirer
        message: 'Path of the env file?',
        name: 'filePath',
        // yargs
        demandOption: true,
        describe: 'Path of the env file',
        // shared
        type: 'string',
        default: '.env.example',
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
        await   handleCreateSecrets(inputs)

        console.log(chalk.green("Secrets Created Successfully"));

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error Creating Secrets"), err);
        process.exit(1);
    }

})();

#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";
import {handleCreateDomain} from "../src/domain/domainDeleteHandler.js";
import chalk from "chalk";
import {handleCreateSecrets} from "../src/k8s/secrets/secretHandler.js";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleBuildAndPushImage} from "../src/docker/dockerHandler.js";

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

        if(globalConfigHandler.globalConfigExists() === false){
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs,secretOptions);
        await   handleBuildAndPushImage(inputs)

        console.log(chalk.green("Successfully pushed Image to registry"));

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error pushing Image to registry"), err);
        // console.error(err);
        process.exit(1);
    }

})();

#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";
import {getDomainStatus, handleCreateDomain, handleDeleteDomain} from "../src/domain/domainDeleteHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";


const options = {

    domainName: {
        // inquirer
        message: 'Name of Domain to be checked?',
        name: 'domainName',
        // yargs
        demandOption: true,
        describe: 'Name of the domain to be checked',
        // shared
        type: 'string',
        default: '',
    }


};



(async () => {


    try {

        const processArgs = process.argv;

        if(globalConfigHandler.globalConfigExists() === false){
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs,options);


        const result = await   getDomainStatus(inputs)
        console.log(chalk.green("Domain Status: ", JSON.stringify(result)));

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error getting status"), err);
        // console.error(err);
        process.exit(1);
    }

})();

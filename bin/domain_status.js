#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as appConfigHandler from "../src/appConfigHandler.js";
import {getDomainStatus, handleCreateDomain, handleDeleteDomain} from "../src/domainHandler.js";
import chalk from "chalk";


const options= {

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
    }


};



(async () => {


    try {

        const processArgs = process.argv;

        if(appConfigHandler.appConfigExists() === false){
            console.log('App Config does not exist. Please run init-config')
            process.exit(1);
        }

        await   getDomainStatus(processArgs)

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error Deleting Domain"), err);
        // console.error(err);
        process.exit(1);
    }

})();

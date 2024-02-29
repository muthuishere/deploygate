#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as appConfigHandler from "../src/appConfigHandler.js";
import {handleCreateDomain, handleDeleteDomain} from "../src/domainHandler.js";
import chalk from "chalk";

// Handle the create-domain command

(async () => {


    try {

        const processArgs = process.argv;

        if(appConfigHandler.appConfigExists() === false){
            console.log('App Config does not exist. Please run init-config')
            process.exit(1);
        }

        await   handleDeleteDomain(processArgs)

        // await createStaticDomain(inputs);
    }catch (err) {

        console.error(chalk.red("Error Deleting Domain"), err);
        // console.error(err);
        process.exit(1);
    }

})();

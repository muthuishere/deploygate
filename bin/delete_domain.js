#!/usr/bin/env node
// Import necessary modules
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";
import {handleCreateDomain, handleDeleteDomain, handleDeleteDomainCommand} from "../src/domain/domainDeleteHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";

// Handle the create-domain command



(async () => {

    const processArgs = process.argv;
    await handleDeleteDomainCommand(processArgs);

})();

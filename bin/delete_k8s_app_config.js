#! /usr/bin/env node
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleDeleteK8sAppConfig, handleGenerateK8sAppConfig} from "../src/k8s/deployments/k8sHandler.js";
import {fileExistsValidator} from "../src/shared/validator.js";
import {getAsJson} from "../src/shared/files.js";


// {appName,appImageUrl,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL}
const options = {

    configFilePath: {
        message: 'Where is the config file located?',
        name: 'configFilePath',
        demandOption: true,
        describe: 'Where is the config file located?',
        type: 'string',
        default: 'deploygateprojectconfig.json',
        validate:fileExistsValidator
    },


};

(async () => {


    try {

        const processArgs = process.argv;

        if (globalConfigHandler.globalConfigExists() === false) {
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs, options);


       const results = await getAsJson(inputs.configFilePath)

        // validate

        await handleDeleteK8sAppConfig(inputs)

        console.log(chalk.green("Successfully Deleted App Config"));

    } catch (err) {

        console.error(chalk.red("Error Deleting App Config"), err);
        // console.error(err);
        process.exit(1);
    }

})();

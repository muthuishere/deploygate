#! /usr/bin/env node
import * as appConfigHandler from "../src/appConfigHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleDeleteK8sAppConfig, handleGenerateK8sAppConfig} from "../src/k8s/k8sHandler.js";
import {fileExistsValidator} from "../src/shared/validator.js";


// {appName,appImageUrl,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL}
const options = {

    projectRootFolder: {
        message: 'What is the root folder of your application?',
        name: 'projectRootFolder',
        demandOption: true,
        describe: 'The root directory of your application files.',
        type: 'string',
        default: '.',
        validate:fileExistsValidator
    },


};

(async () => {


    try {

        const processArgs = process.argv;

        if (appConfigHandler.appConfigExists() === false) {
            console.log('App Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getParametersBasedOnOptions(processArgs, options);

        // console.log("hi",inputs)
        await handleDeleteK8sAppConfig(inputs)

        console.log(chalk.green("Successfully Deleted App Config"));

    } catch (err) {

        console.error(chalk.red("Error Deleting App Config"), err);
        // console.error(err);
        process.exit(1);
    }

})();

#! /usr/bin/env node
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleDeleteK8sAppConfig, handleGenerateK8sAppConfig} from "../src/k8s/deployments/k8sHandler.js";
import {fileExistsValidator} from "../src/shared/validator.js";
import {showLogs} from "../src/k8s/logs/k8sLogStreamer.js";


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
    logMode: {
        message: 'Choose the log mode: tail or export?',
        name: 'logMode',
        demandOption: true,
        describe: 'Set to "tail" to follow the logs live, or "export" to save them to a file in the current working directory.',
        type: 'string',
        choices: ['tail', 'export'],
        default: 'tail'
    }
};

(async () => {


    try {

        const processArgs = process.argv;

        if (globalConfigHandler.globalConfigExists() === false) {
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs, options);

        await showLogs(inputs)



    } catch (err) {

        console.error(chalk.red("Error Showing Logs"), err);
        // console.error(err);
        process.exit(1);
    }

})();

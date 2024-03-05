#! /usr/bin/env node
import * as appConfigHandler from "../src/appConfigHandler.js";
import chalk from "chalk";
import input_arg_processor from "../src/shared/input_arg_processor.js";
import {handleGenerateK8sAppConfig} from "../src/k8s/k8sHandler.js";
import Path from "path";
import  {getAbsolutePath} from "../src/shared/files.js";
import {getWorkingFolderName} from "../src/shared/system_processor.js";
import {getBuildCommand} from "../src/shared/projectfinder.js";
import {fileExistsValidator, onlyStringsAndNumbersValidator} from "../src/shared/validator.js";

const options = {
    appName: {
        message: 'What is the name of your application?',
        name: 'appName',
        demandOption: true,
        describe: 'The name of your application. This will be used as an identifier.',
        type: 'string',
        default: 'MyApp',
        validate:onlyStringsAndNumbersValidator
    },
    projectRootFolder: {
        message: 'What is the root folder of your application?',
        name: 'projectRootFolder',
        demandOption: true,
        describe: 'The root directory of your application files.',
        type: 'string',
        default: '.',
        validate:fileExistsValidator
    },
    buildCommand: {
        message: 'What command should be used to build your app?',
        name: 'buildCommand',
        demandOption: true,
        describe: 'The command to build your Docker image.',
        type: 'string',
        default: 'npm run build',
    },
    dockerFilePath: {
        message: 'Where is your Dockerfile located?',
        name: 'dockerFilePath',
        demandOption: true,
        describe: 'The path to your Dockerfile.',
        type: 'string',
        default: 'Dockerfile',
        validate:fileExistsValidator
    },
    dockerImageTag: {
        message: 'What tag should be used for your Docker image?',
        name: 'dockerImageTag',
        demandOption: true,
        describe: 'The tag for your Docker image (e.g., version number).',
        type: 'string',
        default: '0.0.1',
    },
    appInternalPort: {
        message: 'What internal port does your application use?',
        name: 'appInternalPort',
        demandOption: true,
        describe: 'The internal port that your application listens on.',
        type: 'number',
        default: 80,
    },
    replicas: {
        message: 'How many replicas do you want to deploy?',
        name: 'replicas',
        demandOption: true,
        describe: 'The number of replicated pods in the Kubernetes deployment.',
        type: 'number',
        default: 1,
    },
    kubernetesConfigOutputFolder: {
        message: 'Where should the Kubernetes configuration files be generated?',
        name: 'kubernetesConfigOutputFolder',
        demandOption: true,
        describe: 'The output folder for generated Kubernetes configuration files.',
        type: 'string',
        default: 'dist',
    },
    envFilePath: {
        message: 'Where is your environment file located?',
        name: 'envFilePath',
        demandOption: true,
        describe: 'The path to your environment file (e.g., .env).',
        type: 'string',
        default: '.env',
    },
    domainName: {
        message: 'What is the domain name for your application?',
        name: 'domainName',
        demandOption: true,
        describe: 'The domain name to which your application will respond.',
        type: 'string',
        default: '',
    },
    nodePort: {
        message: 'What NodePort should be used for external access?',
        name: 'nodePort',
        demandOption: true,
        describe: 'The external port for accessing your application.',
        type: 'number',
        default: 80,
    },
    enableSSL: {
        message: 'Do you want to enable SSL for your domain?',
        name: 'enableSSL',
        demandOption: true,
        describe: 'Whether to enable SSL encryption for your domain.',
        type: 'boolean',
        default: true,
    },
};


(async () => {



    try {
        // console.log(Object.keys(options))
        console.log(Path.join(process.cwd(),"."))

        const processArgs = process.argv;

        if (appConfigHandler.appConfigExists() === false) {
            console.log('App Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }

        options.appName.default = getWorkingFolderName();
        // options.projectRootFolder.default = process.cwd()
        const config = await appConfigHandler.loadDeployGateConfig();
        options.appImageUrl.default = config.customRegistryUrl + "/" + options.appName.default;
        options.domainName.default = options.appName.default + ".com";
        options.buildCommand.default = getBuildCommand(options.projectRootFolder.default);



        /**
         * @typedef {Object} AppConfig
         * @property {string} appName - The name of the application
         * @property {number} appPort - The port on which the application runs
         * @property {number} exposedPort - The port exposed by the application
         * @property {string} envFilePath - The path to the environment file
         * @property {number} replicas - The number of replicas for the application
         * @property {string} kubernetesConfigOutputFolder - The folder where the application is delivered
         * @property {string} domainName - The domain name of the application
         * @property {boolean} enableSSL - Whether SSL is enabled for the application
         * @property {string} dockerImageTag - The tag of the application
         * @property {string} projectRootFolder - The root folder of the project
         * @property {string} buildCommand - The command to build the application
         * @property {string} dockerFilePath - The path to the Dockerfile
         */

        /**
         * @type {AppConfig}
         */

        const input = await input_arg_processor.getParametersBasedOnOptions(processArgs, options);





        input.domainName = input.domainName.trim();
        input.appName = input.appName.trim();
        input.dockerImageTag = input.dockerImageTag.trim();
        input.projectRootFolder = input.projectRootFolder.trim();
        input.dockerFilePath = input.dockerFilePath.trim();
        input.kubernetesConfigOutputFolder = input.kubernetesConfigOutputFolder.trim();
        input.envFilePath = input.envFilePath.trim();
        input.envFilePath = getAbsolutePath(input.envFilePath);
        input.kubernetesConfigOutputFolder = getAbsolutePath(input.kubernetesConfigOutputFolder);
        input.dockerFilePath = getAbsolutePath(input.dockerFilePath);
        input.projectRootFolder = getAbsolutePath(input.projectRootFolder);


        console.log(input)
        await handleGenerateK8sAppConfig(input)

        console.log(chalk.green("Successfully generated Kubernetes configuration files for " + input.appName));

        // await createStaticDomain(inputs);
    } catch (err) {

        console.error(chalk.red("Error Creating Domain"), err);
        // console.error(err);
        process.exit(1);
    }

})();

import globalConfigHandler from "../config/globalConfigHandler.js";
import input_arg_processor from "../shared/input_arg_processor.js";

import fileService from "../shared/files.js";
import * as ejs from "ejs";
import {runPlayBookContents} from "../ansible/PlaybookRunner.js";
import chalk from "chalk";
import {getDomainTemplateNamed} from "./domainUtils.js";

export const createDomainOptions = {

    domainName: {
        // inquirer
        message: 'Name of Domain?',
        name: 'domainName',
        // yargs
        demandOption: true,
        describe: 'Name of the domain',
        // shared
        type: 'string',
        default: 'test.somedomain.com',
    },
    redirectPort: {
        // inquirer
        message: 'Port Number?',
        name: 'redirectPort',
        // yargs
        demandOption: true,
        describe: 'Port Number',
        // shared
        type: 'number',
        default: 9898,
    },
    enableSSL: {
        // inquirer
        message: 'Enable SSL?',
        name: 'enableSSL',
        // yargs
        demandOption: true,
        describe: 'Enable SSL',
        // shared
        type: 'boolean',
        default: true,
    },

};


export async function createDomain(hostName, inputs) {




    const { domainName, redirectPort, enableSSL}=inputs
    console.log("Creating domain based on hostName", hostName);
    // console.log("Creating domain based on domainName", domainName,redirectPort,enableSSL);
    const createDomainFilePath = getDomainTemplateNamed('create-redirected-domain.yaml');

    const template = await fileService.readFile(createDomainFilePath);
    const contents = ejs.render(template, {
        hostName, domainName, redirectPort, enableSSL
    });

    // const contents = await renderCreateDomainPlaybook(hostName, inputs);
    // console.log(contents);

    const result = await runPlayBookContents(contents);
// console.log(result)

    return result.stdout.join("\n")
}
export async function handleCreateDomainCommand(processArgs) {
    try {


        if (globalConfigHandler.globalConfigExists() === false) {
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }

        await handleCreateDomain(processArgs)
        console.log(chalk.green("Domain Created Successfully"));

        // await createStaticDomain(inputs);
    } catch (err) {

        console.error(chalk.red("Error Creating Domain"), err);
        // console.error(err);
        process.exit(1);
    }
}

export async function handleCreateDomain(processArgs) {

    const config = await globalConfigHandler.getGlobalConfig()
    const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs,createDomainOptions);

    console.log("Creating domain",inputs);

    const hostName = config.ansibleHostName;
    return await createDomain(hostName, inputs);


}


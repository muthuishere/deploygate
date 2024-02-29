import appConfigHandler from "./appConfigHandler.js";
import input_arg_processor from "./shared/input_arg_processor.js";
import path from "path";
import fileService from "./shared/files.js";
import * as ejs from "ejs";
import {runPlayBookContents} from "./ansible/PlaybookRunner.js";
import chalk from "chalk";

const createDomainOptions = {

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

const deleteDomainOptions = {

    domainName: {
        // inquirer
        message: 'Name of Domain to be deleted?',
        name: 'domainName',
        // yargs
        demandOption: true,
        describe: 'Name of the domain to be deleted',
        // shared
        type: 'string',
        default: '',
    }


};

export async function handleCreateDomain(processArgs) {

    const config = await appConfigHandler.loadDeployGateConfig()
    const inputs = await input_arg_processor.getParametersBasedOnOptions(processArgs,createDomainOptions);

    console.log("Creating domain",inputs);

    const hostName = config.ansibleHostName;

    const contents = await createDomainBasedOn(hostName, inputs);
    // console.log(contents);

const result=    await runPlayBookContents(contents);
// console.log(result)

    console.log(chalk.green("Domain Created Successfully"));




}
export async function handleDeleteDomain(processArgs) {

    const config = await appConfigHandler.loadDeployGateConfig()
    const inputs = await input_arg_processor.getParametersBasedOnOptions(processArgs,deleteDomainOptions);

    const domainName = inputs.domainName;
    console.log("Deleting domain",inputs);

    const hostname = config.ansibleHostName;

    const createDomainFilePath = getDeleteDomainFilePath();

    const template = await fileService.readFile(createDomainFilePath);
    const contents = ejs.render(template, {
        hostname, domainName
    });
    const result=    await runPlayBookContents(contents);


    console.log(chalk.green("Domain Deleted Successfully"));




}

function getCreateDomainFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','domainmanager', 'create-redirected-domain.yaml');
}


function getDeleteDomainFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','domainmanager', 'delete-redirected-domain.yaml');
}


async function createDomainBasedOn(hostname, {domainName, redirectPort, enableSSL}) {

    // console.log("Creating domain based on hostname", hostname);
    // console.log("Creating domain based on domainName", domainName,redirectPort,enableSSL);
    const createDomainFilePath = getCreateDomainFilePath();

    const template = await fileService.readFile(createDomainFilePath);
    return ejs.render(template, {
        hostname, domainName, redirectPort, enableSSL
    });
}

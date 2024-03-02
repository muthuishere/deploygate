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
export async function handleDeleteDomain(inputs) {

    const config = await appConfigHandler.loadDeployGateConfig()
    const domainName = inputs.domainName;


    const hostname = config.ansibleHostName;

    const deleteDomainFilePath = getDeleteDomainFilePath();

    const template = await fileService.readFile(deleteDomainFilePath);
    const contents = ejs.render(template, {
        hostname, domainName
    });
    const result=    await runPlayBookContents(contents);

    if(result.code === 0){
        return result.stdout.join("\n")
    }else {
        throw new Error("Error deleting domain" + result.stderr.join("\n"))
    }




}

function getDomainStatusOutput(input){


    if(input.code !== 0){
        throw new Error("Error getting domain status" + input.stderr.join("\n"))
    }


    const findString = "domain-status-by-name"
    const lines=   input.stdout
        .filter((line) => line.trim().startsWith("changed"))
        .filter((line) => {
            return line.includes(findString)
        });

    if(lines.length == 0){
        throw new Error("No line found")
    }
    if(lines.length > 1){
        throw new Error("More than one line found")
    }

    let line = lines[0];
    if(line.includes("=>")){
        line = line.split("=>")[1].trim()
        const buffer  = JSON.parse(line)
        const result = buffer.stdout
        return    JSON.parse(result);



    }else {
        throw new Error("No => found, found only" +line)
    }
}
export async function getDomainStatus({domainName}) {

    const config = await appConfigHandler.loadDeployGateConfig()


    const hostname = config.ansibleHostName;

    const domainStatusFilePath = getDomainStatusFilePath();

    const template = await fileService.readFile(domainStatusFilePath);
    const contents = ejs.render(template, {
        hostname, domainName
    });
    const playbookResult=    await runPlayBookContents(contents);



    return getDomainStatusOutput(playbookResult);

}

function getCreateDomainFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','domainmanager', 'create-redirected-domain.yaml');
}


function getDeleteDomainFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','domainmanager', 'delete-redirected-domain.yaml');
}


function getDomainStatusFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','domainmanager', 'get-domain-status.yaml');
}


export async function createDomainBasedOn(hostname, {domainName, redirectPort, enableSSL}) {

    // console.log("Creating domain based on hostname", hostname);
    // console.log("Creating domain based on domainName", domainName,redirectPort,enableSSL);
    const createDomainFilePath = getCreateDomainFilePath();

    const template = await fileService.readFile(createDomainFilePath);
    return ejs.render(template, {
        hostname, domainName, redirectPort, enableSSL
    });
}



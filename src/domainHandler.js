import appConfigHandler from "./appConfigHandler.js";
import input_arg_processor from "./shared/input_arg_processor.js";
import path from "path";
import fileService from "./shared/files.js";
import * as ejs from "ejs";
import {runPlayBookContents} from "./ansible/PlaybookRunner.js";

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

export async function handleCreateDomain(processArgs) {

    const config = await appConfigHandler.loadDeployGateConfig()
    const inputs = await input_arg_processor.getParametersBasedOnOptions(processArgs,createDomainOptions);

    console.log("Creating domain",inputs);

    const hostName = config.ansibleHostName;
    return await createDomain(hostName, inputs);


}
export async function handleDeleteDomain(inputs) {

    const config = await appConfigHandler.loadDeployGateConfig()
    const domainName = inputs.domainName;


    const hostName = config.ansibleHostName;

    const deleteDomainFilePath = getDomainTemplateNamed('delete-redirected-domain.yaml');

    const template = await fileService.readFile(deleteDomainFilePath);
    const contents = ejs.render(template, {
        hostName, domainName
    });
    const result=    await runPlayBookContents(contents);

    if(result.code === 0){
        return result.stdout.join("\n")
    }else {
        throw new Error("Error deleting domain" + result.stderr.join("\n"))
    }




}

function parseDomainStatus(input){


    if(input.code !== 0){
        throw new Error("Error getting domain status" + input.stderr.join("\n"))
    }


    const lines=   input.stdout
        .filter((line) => line.trim().startsWith("changed"))
        .filter((line) => {
            return line.includes("domain-status-by-name")
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


    const hostName = config.ansibleHostName;

    const domainStatusFilePath = getDomainTemplateNamed('delete-redirected-domain.yam');

    const template = await fileService.readFile(domainStatusFilePath);
    const contents = ejs.render(template, {
        hostName, domainName
    });
    const playbookResult=    await runPlayBookContents(contents);



    return parseDomainStatus(playbookResult);

}

function getDomainTemplateNamed(filePath) {
    return path.join(fileService.getProjectRootFolder(), 'assets', 'domainmanager', filePath);
}


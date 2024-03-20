import globalConfigHandler from "../config/globalConfigHandler.js";
import input_arg_processor from "../shared/input_arg_processor.js";

import fileService from "../shared/files.js";
import * as ejs from "ejs";
import {runPlayBookContents} from "../ansible/PlaybookRunner.js";
import chalk from "chalk";
import {getDomainTemplateNamed} from "./domainUtils.js";

export const deleteDomainOptions = {

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


export async function handleDeleteDomainCommand(processArgs) {
    try {


        if (globalConfigHandler.globalConfigExists() === false) {
            console.log('Global Config does not exist. Please run init-deploy-gate-config')
            process.exit(1);
        }
        const inputs = await input_arg_processor.getProcessedCommandLineParameters(processArgs, deleteDomainOptions);


        await handleDeleteDomain(inputs)
        console.log(chalk.green("Domain Deleted Successfully"));

        // await createStaticDomain(inputs);
    } catch (err) {

        console.error(chalk.red("Error Deleting Domain"), err);
        // console.error(err);
        process.exit(1);
    }
}
export async function handleDeleteDomain(inputs) {

    const config = await globalConfigHandler.getGlobalConfig()
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

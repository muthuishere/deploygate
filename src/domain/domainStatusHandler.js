import path from "path";
import fileService from "../shared/files.js";
import globalConfigHandler from "../config/globalConfigHandler.js";
import * as ejs from "ejs";
import {runPlayBookContents} from "../ansible/PlaybookRunner.js";



export function parseDomainStatus(input){


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

    const config = await globalConfigHandler.getGlobalConfig()


    const hostName = config.ansibleHostName;

    const domainStatusFilePath = getDomainTemplateNamed('delete-redirected-domain.yam');

    const template = await fileService.readFile(domainStatusFilePath);
    const contents = ejs.render(template, {
        hostName, domainName
    });
    const playbookResult=    await runPlayBookContents(contents);



    return parseDomainStatus(playbookResult);

}


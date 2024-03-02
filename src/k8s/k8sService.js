import * as fileService from "../shared/files.js";
import {runProcess} from "../shared/system_processor.js";



export function executeKubCtlCommandWith(args) {
    let namespace = "default"

    return runProcess('kubectl', ['--namespace', namespace,  ...args]);
}


export async function applyKubeCtlFile(tempFile) {
    return await executeKubCtlCommandWith( ['apply', "-f", tempFile]);
}

export async function executeKubectlContents(contents) {

    let tempFile;
    try {
        tempFile = fileService.getRandomtempYamlFileName();
        await fileService.writeFile(tempFile, contents);

        return await applyKubeCtlFile(tempFile);
    }catch (e){
        throw e;
    } finally {


       await fileService.deleteFile(tempFile)
    }


}


export async function getCurrentContext() {
const result =     await runProcess('kubectl', ['config', 'current-context']);
return result.stdout[0];
}
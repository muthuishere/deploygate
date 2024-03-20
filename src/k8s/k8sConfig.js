import path from "path";
import fileService, {getAsJson} from "../shared/files.js";

const DEPLOY_GATE_PROJECT_CONFIG_FILE_NAME = 'deploygateprojectconfig.json';

export function getProjectConfig(projectRootFolder) {
    const configFilePath = path.join(projectRootFolder, DEPLOY_GATE_PROJECT_CONFIG_FILE_NAME);
    return getAsJson(configFilePath)
}

export async function saveProjectConfig(deployGateConfig, projectRootFolder) {

    const  configFilePath = path.join(projectRootFolder, DEPLOY_GATE_PROJECT_CONFIG_FILE_NAME);
    await fileService.writeFile(configFilePath, JSON.stringify(deployGateConfig, null, 2))
}
export async function deleteProjectConfig(projectRootFolder) {

    const  configFilePath = path.join(projectRootFolder, DEPLOY_GATE_PROJECT_CONFIG_FILE_NAME);
    await fileService.deleteFile(configFilePath)
}
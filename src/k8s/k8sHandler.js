import {executeKubCtlCommandWith} from "./k8sService.js";

export async function isDeploymentExistsForApp(appName) {
    const deploymentName = `${appName}-deployment`;


    const  results  = await executeKubCtlCommandWith(["get", "deployment", deploymentName]);

    const exists = results.code === 0;
    return exists;

}
export async function isServiceExistsForApp(appName) {

    const serviceName = `${appName}-service`;
    const  results  = await executeKubCtlCommandWith(["get", "service", serviceName]);

    return results.code === 0;

}

/*

It should generate based on appName,appPath,  appBuildCommand,envFilePath,dockerFilePath,applicationPort , exposedPort

 */

export async function handleGenerateK8sAppConfig(inputs) {

    const {appName,appImageUrl,appPort,exposedPort} = inputs;
    const appDeploymentName = `${appName}-deployment`;
    const appServiceName = `${appName}-service`;
    const appAlreadyExists = await isDeploymentExists(appDeploymentName);

    if (appAlreadyExists) {
        throw `Deployment ${appName} already exists`;

    }




}
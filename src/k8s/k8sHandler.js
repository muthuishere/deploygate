import {executeKubCtlCommandWith} from "./k8sService.js";
import {handleCreateSecrets} from "./secretHandler.js";
import path from "path";
import fileService from "../shared/files.js";
import * as ejs from "ejs";
import  appConfigHandler from "../appConfigHandler.js"
import * as yaml from "js-yaml";
import {createDomainBasedOn} from "../domainHandler.js";

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

function generateDeploymentContents(createSecretResponse, contents, customRegistryCredentialsName) {
    const keys = createSecretResponse.keys;
    const secretGroupName = createSecretResponse.secretGroupName;
    const yamlInstance = yaml.load(contents);
    if (keys && keys.length > 0) {
        const envVars = keys.map(key => {

            return {
                name: key,
                valueFrom: {
                    secretKeyRef: {
                        name: secretGroupName,
                        key: key
                    }
                }
            };
        });
        const containers = yamlInstance.spec.template.spec.containers;
        if (containers && containers.length > 0) {
            containers[0].env = envVars;
        }
    }
    if (customRegistryCredentialsName) {
        yamlInstance.spec.template.spec.imagePullSecrets = [{name: customRegistryCredentialsName}]
    }
    const newContents = yaml.dump(yamlInstance);
    return newContents;
}

export async function handleGenerateK8sAppConfig(inputs) {

    const {appName,appImageUrl,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL} = inputs;

    if(fileService.folderExists(deliveryFolder) === false){
        throw new Error(`${deliveryFolder} folder does not exist`);

    }

    const deploymentExists = await isDeploymentExistsForApp(appName);

    if (deploymentExists) {
        throw `Deployment for ${appName} already exists`;

    }


    const serviceAlreadyExists = await isServiceExistsForApp(appName);

    if (serviceAlreadyExists) {
        throw `Service for ${appName} already exists`;

    }
    const {customRegistryCredentialsName}  = await appConfigHandler.loadDeployGateConfig()

   const createSecretResponse= await handleCreateSecrets({appName,filePath:envFilePath});


    const deploymentTemplate = await fileService.readFile(getDeploymentFilePath());
    const deployTemplateContents = ejs.render(deploymentTemplate, {
        appName,
        appImageUrl,
        appPort,
        replicas

    });
    const deploymentContents = generateDeploymentContents(createSecretResponse, deployTemplateContents, customRegistryCredentialsName);

    const deploymentFilePath = path.join(deliveryFolder, `${appName}-deployment.yaml`);
    await    fileService.writeFile(deploymentFilePath, deploymentContents);

    console.log(deploymentContents)

    const serviceTemplate = await fileService.readFile(getServiceFilePath());
    const serviceContents = ejs.render(serviceTemplate, {
        appName,
        appPort,
        exposedPort
    });
    console.log(serviceContents)
    const serviceFilePath = path.join(deliveryFolder, `${appName}-service.yaml`);
await    fileService.writeFile(serviceFilePath, serviceContents);

    const {ansibleHostName} = await appConfigHandler.loadDeployGateConfig()
    const createDomainResponse  = await createDomainBasedOn(ansibleHostName, {domainName, redirectPort:exposedPort, enableSSL})
    console.log(createDomainResponse)


    return {
        deploymentFilePath,
        serviceFilePath,
        createSecretResponse,
        createDomainResponse

    };



}
function getDeploymentFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','k8s', 'app-deployment.yaml');
}



function getServiceFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','k8s', 'app-service.yaml');
}


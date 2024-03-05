import {applyKubeCtlFile, executeKubCtlCommandWith} from "./k8sService.js";
import {handleCreateSecrets} from "./secretHandler.js";
import path from "path";
import fileService from "../shared/files.js";
import * as ejs from "ejs";
import appConfigHandler from "../appConfigHandler.js"
import * as yaml from "js-yaml";
import {createDomain, handleDeleteDomain} from "../domainHandler.js";
import logger from "../shared/logger.js";
import {runProcessFromFolder} from "../shared/system_processor.js";
import {getDeployGateConfig} from "../docker/dockerHandler.js";
import {isGitStatusClean} from "../shared/gitOps.js";
import * as dockerHandler from "../docker/dockerHandler.js";
import chalk from "chalk";
import {incrementVersion} from "../shared/versionManager.js";

export async function isDeploymentExistsForApp(appName) {
    const deploymentName = `${appName}-deployment`;


    const  results  = await executeKubCtlCommandWith(["get", "deployment", deploymentName]);

    return results.code === 0;

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
    return yaml.dump(yamlInstance);
}

async function getAsJson(folder) {

}

export async function handleDeleteK8sAppConfig(input) {
    const projectRootFolder = input.projectRootFolder;
    const config= await    getDeployGateConfig(projectRootFolder)
    console.log(config)

    // const {configFilePath, config} = await getAsJson(folder);
    const {appName,appImageUrl,deploymentFilePath,serviceFilePath,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL,tag,buildCommand,dockerFilePath} = config;
//<%= appName %>-secret

    const secretGroupName = `${appName}-secret`;
    const deploymentName = `${appName}-deployment`;
    const serviceName = `${appName}-service`;
    // should add delete secret
    let  results  = await executeKubCtlCommandWith(["delete", "secret", secretGroupName]);

    if(results.code !== 0){
       console.error(`Secret for ${appName} does not exists`);
    }

results  = await executeKubCtlCommandWith(["delete", "deployment", deploymentName]);

    if(results.code !== 0){
       console.error(`deployment for ${appName} does not exists`);
    }


results  = await executeKubCtlCommandWith(["delete", "service", serviceName]);

    if(results.code !== 0){
       console.error(`service for ${appName} does not exists`);
    }


    if(!!domainName ) {
        try {
            await handleDeleteDomain({domainName})
        } catch (e) {
            console.error(`error on deleting ${domainName} `, e);
        }
    }
await    fileService.deleteFile(deploymentFilePath);
await    fileService.deleteFile(serviceFilePath);

await deleteDeployGateConfig(projectRootFolder);



}

export function getDeployGateConfig(projectRootFolder) {
    const configFilePath = path.join(projectRootFolder, 'deploygateconfig.json');
    return getAsJson(configFilePath)
}

async function saveDeployGateConfig(deployGateConfig, projectRootFolder) {

    const  configFilePath = path.join(projectRootFolder, 'deploygateconfig.json');
    await fileService.writeFile(configFilePath, JSON.stringify(deployGateConfig, null, 2))
}
async function deleteDeployGateConfig(projectRootFolder) {

    const  configFilePath = path.join(projectRootFolder, 'deploygateconfig.json');
    await fileService.deleteFile(configFilePath)
}

async function createDeploymentFile(input) {
const    {appImageUrl, dockerImageTag, appName, appInternalPort, replicas, createSecretResponse, customRegistryCredentialsName, deploymentFilePath} = input;
    const deploymentTemplate = await fileService.readFile(getDeploymentFilePath());
    let appImageUrlWithTag = appImageUrl + ":" + dockerImageTag;
    const deployTemplateContents = ejs.render(deploymentTemplate, {
        appName,
        appImageUrlWithTag,
        appInternalPort,
        replicas

    });
    const deploymentContents = generateDeploymentContents(createSecretResponse, deployTemplateContents, customRegistryCredentialsName);


    logger.debug(`deploymentContents ${deploymentContents}`)

    await fileService.writeFile(deploymentFilePath, deploymentContents);

}

async function createServiceFile(input) {
    const {appName, appInternalPort, nodePort, serviceFilePath} = input;
    const serviceTemplate = await fileService.readFile(getServiceFilePath());
    const serviceContents = ejs.render(serviceTemplate, {
        appName,
        appInternalPort,
        nodePort
    });
    logger.debug(`serviceContents ${serviceContents}`)

    await fileService.writeFile(serviceFilePath, serviceContents);
}

export async function handleGenerateK8sAppConfig(inputs) {

    //const {appName,appImageUrl,appPort,exposedPort,envFilePath,replicas,deliveryFolder,domainName,enableSSL,tag,projectRootFolder,buildCommand,dockerFilePath} = inputs;

    const {
        appName,
        projectRootFolder,
        buildCommand,
        dockerFilePath,
        dockerImageTag,

        appInternalPort,
        replicas,
        kubernetesConfigOutputFolder,
        envFilePath,
        domainName,
        nodePort,
        enableSSL
    } = inputs;

//    appName, tag, dockerFile, registry
    const  config = await appConfigHandler.loadDeployGateConfig();
    const {dockerRegistryUrl} = config;
    const appImageUrl = `${dockerRegistryUrl}/${appName}`;


    console.log(inputs)
    // if appName has any special characters or spaces , throw error
    if(!!appName === false){
        throw new Error("appName is required");
    }

    if (appName.match(/[^a-z0-9-]/)) {
        throw new Error("appName should only contain lowercase letters, numbers and hyphens");
    }

    if(!!nodePort === false){
        throw new Error("exposedPort is required");
    }
    if(!!appImageUrl === false){
        throw new Error("appImageUrl is required");
    }
    if(!!appInternalPort === false){
        throw new Error("Container port is required");
    }
    if(!!kubernetesConfigOutputFolder === false){
        throw new Error("deliveryFolder is required");
    }

    if(fileService.folderExists(kubernetesConfigOutputFolder) === false){
       await fileService.createFolder(kubernetesConfigOutputFolder);
    }


    if(fileService.folderExists(kubernetesConfigOutputFolder) === false){
        throw new Error(`${kubernetesConfigOutputFolder} folder does not exist`);

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

    // create project config file
    const  configFilePath = path.join(projectRootFolder, 'deploygateconfig.json');


    if(fileService.fileExists(configFilePath) ){
        throw `Config file for ${appName} already exists`;
    }

    const deploymentFilePath = path.join(kubernetesConfigOutputFolder, `${appName}-deployment.yaml`);
    const serviceFilePath = path.join(kubernetesConfigOutputFolder, `${appName}-service.yaml`);



    const    createSecretResponse= await handleCreateSecrets({appName,filePath:envFilePath});
   await createDeploymentFile({appImageUrl, dockerImageTag, appName, appInternalPort, replicas, createSecretResponse, customRegistryCredentialsName, deploymentFilePath});
    await createServiceFile({appName, appInternalPort, nodePort, serviceFilePath});
    let createDomainResponse;
if(!!domainName ){
    console.log("Creating domain based on domainName", domainName, nodePort, enableSSL);
    const {ansibleHostName} = await appConfigHandler.loadDeployGateConfig()
     createDomainResponse  = await createDomain(ansibleHostName, {domainName, redirectPort:nodePort, enableSSL})
    console.log(createDomainResponse)
}

    const deployGateConfig = {
        ...inputs,
        deploymentFilePath,
        createSecretResponse,
        serviceFilePath
    }
    await saveDeployGateConfig(deployGateConfig, projectRootFolder);

    await    deployApplication({projectRootFolder, dockerImageTag});


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

/**
 * @typedef {Object} Input
 * @property {string} projectRootFolder - The root folder of the project
 * @property {('major'|'minor'|'patch')} incrementType - The next version Increment type
 */



async function runBuild(buildCommand, projectRootFolder) {
    const commands = buildCommand.split(" ").map((command) => command.trim());

    const appBuildCommand = commands[0];
    const appBuildArgs = commands.slice(1);

    const buildResults = await runProcessFromFolder(projectRootFolder, appBuildCommand, appBuildArgs);

    if(buildResults.code !== 0){
        throw new Error(`Error building with ${buildCommand}  ${buildResults.stderr.join('\n')}`)
    }
    return buildResults;
}

async function deployApplication({projectRootFolder, dockerImageTag}) {
    const deployGateConfig = await getDeployGateConfig(projectRootFolder)
    const {
        appName,

        buildCommand,
        dockerFilePath,

        appInternalPort,
        replicas,
        kubernetesConfigOutputFolder,
        envFilePath,
        domainName,
        deploymentFilePath,
        serviceFilePath,
        nodePort,
        enableSSL
    } = deployGateConfig;
    const isClean = await isGitStatusClean(projectRootFolder);
    if (isClean) {
        throw new Error("Please commit your changes before deploying")
    }


    const {dockerRegistryUrl} = await appConfigHandler.loadDeployGateConfig();
    const appImageUrl = `${dockerRegistryUrl}/${appName}`;

    const updatedAppImageUrl = `${appImageUrl}:${dockerImageTag}`;





    console.log(chalk.yellowBright("Building Application"))

    const buildResults = await runBuild(buildCommand, projectRootFolder);


    const contents = await dockerHandler.handleBuildAndPushImage({
        appName,
        dockerImageTag,
        dockerFilePath,
        dockerRegistryUrl
    })

    await updateDeploymentFile(deploymentFilePath, updatedAppImageUrl);

    console.log(chalk.yellowBright(`Applying Deployment ${deploymentFilePath}`))

    await applyKubeCtlFile(deploymentFilePath);

    console.log(chalk.yellowBright(`Applying Service ${deploymentFilePath}`))

    await applyKubeCtlFile(serviceFilePath);

    const updatedDeployGateConfig = {
        ...deployGateConfig,
        dockerImageTag,
        lastDeployed: new Date().toISOString()
    }
    await saveDeployGateConfig(updatedDeployGateConfig, projectRootFolder);

    console.log(chalk.green(`Successfully Deployed Application ${domainName}`))
    return updatedDeployGateConfig;

}

/**
 * @param {Input} input - The input object
 */
export async function handleK8sReleaseNext(input) {

    const {projectRootFolder, incrementType} = input
    const config = await getDeployGateConfig(projectRootFolder)

    const dockerImageTag = incrementVersion(config.dockerImageTag, incrementType);
    await deployApplication({projectRootFolder, dockerImageTag});


}

export async function updateDeploymentFile(deploymentFilePath, updatedAppImageUrl) {
    try {


        const yamlContent = await fileService.readFile(deploymentFilePath);

        // Parse the YAML content
        let doc = yaml.load(yamlContent);

        // Update the image
        doc.spec.template.spec.containers[0].image = updatedAppImageUrl;

        // Return the updated YAML content
        const updatedContents = yaml.dump(doc);
        // const updatedContents = updateContainerImage(deploymentTemplate, updatedAppImageUrl);
        await fileService.writeFile(deploymentFilePath, updatedContents);

    } catch (e) {
        console.error(e);
        throw new Error("Unable to update deployment file")
    }
}

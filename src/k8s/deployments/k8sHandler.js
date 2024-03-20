import {
    applyKubeCtlFile,
    executeKubectlCommandWithArgs,
    isDeploymentExistsForApp,
    isServiceExistsForApp
} from "../services/k8sService.js";
import {handleCreateSecrets} from "../secrets/secretHandler.js";
import path from "path";
import fileService from "../../shared/files.js";
import globalConfigHandler from "../../config/globalConfigHandler.js"
import { handleDeleteDomain} from "../../domain/domainDeleteHandler.js";
import {runProcessFromFolder} from "../../shared/system_processor.js";
import {isGitStatusClean} from "../../shared/gitOps.js";
import * as dockerHandler from "../../docker/dockerHandler.js";
import chalk from "chalk";
import {incrementVersion} from "../../shared/version_manager.js";
import {deleteProjectConfig, getProjectConfig, saveProjectConfig} from "../k8sConfig.js";
import {createDeploymentFile, createServiceFile, updateDeploymentFile} from "./k8sDeploymentServiceBuilder.js";
import logger from "../../shared/logger.js";
import {createDomain} from "../../domain/domainCreateHandler.js";

/*

It should generate based on appName,appPath,  appBuildCommand,envFilePath,dockerFilePath,applicationPort , exposedPort

 */


export async function handleDeleteK8sAppConfig(input) {
    const projectRootFolder = input.projectRootFolder;
    const config = await getProjectConfig(projectRootFolder)
    console.log(config)

    // const {configFilePath, config} = await getAsJson(folder);
    const {
        appName,
        appImageUrl,
        deploymentFilePath,
        serviceFilePath,
        appPort,
        exposedPort,
        envFilePath,
        replicas,
        deliveryFolder,
        domainName,
        enableSSL,
        tag,
        buildCommand,
        dockerFilePath
    } = config;


    const secretGroupName = `${appName}-secret`;
    const deploymentName = `${appName}-deployment`;
    const serviceName = `${appName}-service`;
    // should add delete secret
    let results = await executeKubectlCommandWithArgs(["delete", "secret", secretGroupName]);

    if (results.code !== 0) {
        console.error(`Secret for ${appName} does not exists`);
    }

    results = await executeKubectlCommandWithArgs(["delete", "deployment", deploymentName]);

    if (results.code !== 0) {
        console.error(`deployment for ${appName} does not exists`);
    }


    results = await executeKubectlCommandWithArgs(["delete", "service", serviceName]);

    if (results.code !== 0) {
        console.error(`service for ${appName} does not exists`);
    }


    if (!!domainName) {
        try {
            await handleDeleteDomain({domainName})
        } catch (e) {
            console.error(`error on deleting ${domainName} `, e);
        }
    }


    if (fileService.fileExists(deploymentFilePath)) {
        await fileService.deleteFile(deploymentFilePath);
    }

    if (fileService.fileExists(serviceFilePath)) {
        await fileService.deleteFile(serviceFilePath);
    }

    await deleteProjectConfig(projectRootFolder);


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
        enableSSL,
        configFileName
    } = inputs;

//    appName, tag, dockerFile, registry
    const config = await globalConfigHandler.getGlobalConfig();
    logger.info(config)
    const {dockerRegistryUrl} = config;
    const appImageUrl = `${dockerRegistryUrl}/${appName}`;


    console.log(inputs)
    // if appName has any special characters or spaces , throw error
    if (!!appName === false) {
        throw new Error("appName is required");
    }

    if (appName.match(/[^a-z0-9-]/)) {
        throw new Error("appName should only contain lowercase letters, numbers and hyphens");
    }

    if (!!nodePort === false) {
        throw new Error("exposedPort is required");
    }
    if (!!appImageUrl === false) {
        throw new Error("appImageUrl is required");
    }
    if (!!appInternalPort === false) {
        throw new Error("Container port is required");
    }
    if (!!kubernetesConfigOutputFolder === false) {
        throw new Error("deliveryFolder is required");
    }

    if (fileService.folderExists(kubernetesConfigOutputFolder) === false) {
        await fileService.createFolder(kubernetesConfigOutputFolder);
    }


    if (fileService.folderExists(kubernetesConfigOutputFolder) === false) {
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
    const {customRegistryCredentialsName} = await globalConfigHandler.getGlobalConfig()

    // create project config file
    if (fileService.fileExists(configFileName)) {
        throw `Config file for ${appName} already exists`;
    }



    const deploymentFilePath = path.join(kubernetesConfigOutputFolder, `${appName}-deployment.yaml`);
    const serviceFilePath = path.join(kubernetesConfigOutputFolder, `${appName}-service.yaml`);


    let createSecretResponse
    try {
         createSecretResponse = await handleCreateSecrets({appName, filePath: envFilePath});
    }catch (e) {
        console.error("Error on creating secrets",e)
        throw "Error on creating secrets" + e;
    }

    await createDeploymentFile({
        appImageUrl,
        dockerImageTag,
        appName,
        appInternalPort,
        replicas,
        createSecretResponse,
        customRegistryCredentialsName,
        deploymentFilePath
    });
    await createServiceFile({appName, appInternalPort, nodePort, serviceFilePath});
    let createDomainResponse;
    if (!!domainName) {
        console.log("Creating domain based on domainName", domainName, nodePort, enableSSL);
        const {ansibleHostName} = await globalConfigHandler.getGlobalConfig()
        createDomainResponse = await createDomain(ansibleHostName, {domainName, redirectPort: nodePort, enableSSL})
        console.log(createDomainResponse)
    }

    const secretGroupName = `${appName}-secret`;
    const deploymentName = `${appName}-deployment`;
    const serviceName = `${appName}-service`;


    const projectConfig = {
        ...inputs,
        deploymentFilePath,
        createSecretResponse,
        serviceName,
        deploymentName,
        secretGroupName,
        serviceFilePath
    }
    await saveProjectConfig(projectConfig, projectRootFolder);


    //TODO: Validate Do we need to deploy ?
    // Yes , User wants one click deploy

    console.log(chalk.yellowBright("Building Application" + dockerImageTag))

    await handleK8sDeploy({projectRootFolder, dockerImageTag});


    return {
        deploymentFilePath,
        serviceFilePath,
        createSecretResponse,
        createDomainResponse

    };


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

    if (buildResults.code !== 0) {
        throw new Error(`Error building with ${buildCommand}  ${buildResults.stderr.join('\n')}`)
    }
    return buildResults;
}

async function handleK8sDeploy({projectRootFolder, dockerImageTag}) {
    const projectConfig = await getProjectConfig(projectRootFolder)



    const {
        appName,
        buildCommand,
        dockerFilePath,
        domainName,
        deploymentFilePath,
        serviceFilePath,

    } = projectConfig;
    const isClean = await isGitStatusClean(projectRootFolder);
    if (isClean) {
        throw new Error("Please commit your changes before deploying")
    }


    const {customRegistryUrl} = await globalConfigHandler.getGlobalConfig();
    logger.info(projectConfig)


    const appImageUrl = `${customRegistryUrl}/${appName}:${dockerImageTag}`;


    console.log(chalk.yellowBright("Building Application" + appImageUrl))


    const buildResults = await runBuild(buildCommand, projectRootFolder);


    //   const dockerFilePath= testConfig.newProjectConfig.dockerFilePath
    //         const dockerRegistryUrl= testConfig.deployGateConfig.customRegistryUrl
    //         const appName = 'test'
    //         const dockerImageTag = 'latest'
    //
    //
    //
    //        const contents = await dockerHandler.handleBuildAndPushImage({appName, dockerImageTag, dockerFilePath, dockerRegistryUrl})
    //


    const contents = await dockerHandler.handleBuildAndPushImage({
        appName,
        dockerImageTag,
        dockerFilePath,
        dockerRegistryUrl:customRegistryUrl
    })

    await updateDeploymentFile(deploymentFilePath, appImageUrl);

    console.log(chalk.yellowBright(`Applying Deployment ${deploymentFilePath}`))

    await applyKubeCtlFile(deploymentFilePath);

    console.log(chalk.yellowBright(`Applying Service ${deploymentFilePath}`))

    await applyKubeCtlFile(serviceFilePath);

    const updatedDeployGateConfig = {
        ...projectConfig,
        dockerImageTag,
        lastDeployed: new Date().toISOString()
    }
    await saveProjectConfig(updatedDeployGateConfig, projectRootFolder);

    console.log(chalk.green(`Successfully Deployed Application ${domainName}`))
    return updatedDeployGateConfig;

}

/**
 * @param {Input} input - The input object
 */
export async function handleK8sReleaseNext(input) {

    const {projectRootFolder, incrementType} = input
    const config = await getProjectConfig(projectRootFolder)

    const dockerImageTag = incrementVersion(config.dockerImageTag, incrementType);
    await handleK8sDeploy({projectRootFolder, dockerImageTag});


}

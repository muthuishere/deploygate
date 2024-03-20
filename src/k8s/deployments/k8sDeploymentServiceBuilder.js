import * as yaml from "js-yaml";
import fileService from "../../shared/files.js";
import * as ejs from "ejs";
import logger from "../../shared/logger.js";
import path from "path";

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


export async function createDeploymentFile(input) {
    const {
        appImageUrl,
        dockerImageTag,
        appName,
        appInternalPort,
        replicas,
        createSecretResponse,
        customRegistryCredentialsName,
        deploymentFilePath
    } = input;
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

export async function createServiceFile(input) {
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

function getDeploymentFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets', 'k8s', 'app-deployment.yaml');
}


function getServiceFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets', 'k8s', 'app-service.yaml');
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



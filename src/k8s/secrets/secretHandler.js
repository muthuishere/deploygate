import path from "path";
import fileService from "../../shared/files.js";
import * as ejs from "ejs";
import * as yaml from "js-yaml";
import {executeKubectlCommandWithArgs, executeKubectlContents} from "../services/k8sService.js";

export function base64Encode(str) {

    return Buffer.from(str.trim()).toString('base64');
}

function getSecretFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets', 'k8s', 'secret.yaml');
}


/*
@returns {Promise<{}>}
 */
export async function envToJson(filePath) {
    try {
        // Read the contents of the file
        const fileContents = await fileService.readFile(filePath);

        // Split the contents by new line and filter out empty lines or comments
        const lines = fileContents.split('\n').filter(line => line && line.trim() && !line.trim().startsWith('#'));

        // Convert lines to key-value pairs and accumulate in an object
        const result = lines.reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key.trim()] = value.trim();
            return acc;
        }, {});

        return result;
    } catch (err) {
        console.error('Error reading .env file:', err);
        return {};
    }
}

export async function handleCreateSecrets(inputs) {
    const {appName, filePath} = inputs
    const secretGroupName = `${appName}-secret`;

    if (!!filePath) {
        return {
            secretGroupName: secretGroupName,
            keys: []
        }
    }

    const exists = fileService.fileExists(filePath);
    if (exists === false) {
        throw new Error('Env File does not exist');

    }

    // const contents = await createSecretsFromEnvFile(appName, filePath);
    const entries = await envToJson(filePath);
    const contents = await createYmlBasedOnJson(entries, appName);

    const results = await executeKubectlContents(contents);
    if (results.code !== 0) {
        throw new Error(results.stderr);
    }
    // const entries = await envToJson(filePath);


    return {
        secretGroupName: secretGroupName,
        keys: Object.keys(entries)
    }


}

async function createYmlBasedOnJson(entries, appName) {
    const secrets = {}
    for (const [key, value] of Object.entries(entries)) {
        secrets[key] = base64Encode(value)
    }
    const secretFilePath = getSecretFilePath();

    const template = await fileService.readFile(secretFilePath);
    const contents = ejs.render(template, {
        appName
    });

    const yamlInstance = yaml.load(contents);
    yamlInstance.data = {}
    for (const [key, value] of Object.entries(secrets)) {
        // secrets[key] = base64Encode(value)
        yamlInstance.data[key] = secrets[key]
    }
    const newContents = yaml.dump(yamlInstance);
    return newContents;
}

export async function createSecretsFromEnvFile(appName, envFilePath) {
    const entries = await envToJson(envFilePath);
    return await createYmlBasedOnJson(entries, appName);

}

export async function handleGetAllSecrets(secretGroupName) {

    const results = await executeKubectlCommandWithArgs(["get", "secret", secretGroupName, "-o", "jsonpath={.data}"]);

    if (results.code !== 0) {
        throw new Error(results.stderr);
    }

    if (results.stdout && results.stdout.length > 0) {
        return JSON.parse(results.stdout[0]);
    }

    return {};
}

export async function isSecretExists(secretGroupName, key) {

    try {
        const results = await handleGetAllSecrets(secretGroupName);
        return results.hasOwnProperty(key)
    } catch (e) {
        return false;
    }

}

export async function isRegistrySecretExists(secretGroupName) {

    try {
        const results = await handleGetAllSecrets(secretGroupName);
        return Object.keys(results).length !== 0;


    } catch (e) {
        return false;
    }

}

export async function deleteSecret(secretGroupName) {

    const results = await executeKubectlCommandWithArgs(["delete", "secret", secretGroupName]);
    if (results.code !== 0) {
        throw new Error(results.stderr);
    }
    return results;
}
export async function createDockerRegistrySecret({registryUrl, username, password, email, secretName}) {

    const isExists = await isRegistrySecretExists(secretName);
    if (isExists) {
       await  deleteSecret(secretName)

    }


    const results = await executeKubectlCommandWithArgs(["create", "secret", "docker-registry", secretName, "--docker-server", registryUrl, "--docker-username", username, "--docker-password", password, "--docker-email", email]);
    if (results.code !== 0) {
        throw new Error(results.stderr);
    }
    return results;
}
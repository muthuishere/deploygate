import appConfigHandler from "../appConfigHandler.js";
import path from "path";
import fileService from "../shared/files.js";
import * as ejs from "ejs";
import * as yaml from "js-yaml";
import {executeKubCtlCommandWith, executeKubectlContents} from "./k8sService.js";

export  function base64Encode(str) {

    return Buffer.from(str.trim()).toString('base64');
}

function getSecretFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','k8s', 'secret.yaml');
}



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

    const exists =   fileService.fileExists(filePath);
    if(exists === false){
        throw new Error('Env File does not exist');

    }

    const contents = await createSecretsFromEnvFile(appName, filePath);
    return await executeKubectlContents(contents);
}

export async function createSecretsFromEnvFile(appName,filePath){
    const entries = await envToJson(filePath);
    const secrets = {}
    for (const [key, value] of Object.entries(entries)) {
        secrets[key] =  base64Encode(value)
    }
    const secretFilePath = getSecretFilePath();

    const template = await fileService.readFile(secretFilePath);
    const contents = ejs.render(template, {
        appName
    });

    const yamlInstance = yaml.load(contents);
    yamlInstance.data={}
    for (const [key, value] of Object.entries(secrets)) {
        // secrets[key] = base64Encode(value)
        yamlInstance.data[key] = secrets[key]
    }
    const newContents = yaml.dump(yamlInstance);
    return newContents;

}
export async function handleGetAllSecrets(secretGroupName) {

    const  results  = await executeKubCtlCommandWith(["get", "secret", secretGroupName, "-o", "jsonpath={.data}"]);

    if(results.code !== 0) {
        throw new Error(results.stderr);
    }

    if( results.stdout && results.stdout.length > 0){
        return JSON.parse(results.stdout[0]);
    }

    return {};
}

export async  function isSecretExists(secretGroupName,key) {

    try {
       const  results= handleGetAllSecrets(secretGroupName);
         return results.hasOwnProperty(key)
    }catch (e) {
        return false;
    }

}

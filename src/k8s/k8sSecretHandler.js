import {K8sService} from "./k8sService.js";
import appConfigHandler from "../appConfigHandler.js";
import path from "path";
import fileService from "../shared/files.js";
import * as ejs from "ejs";
import * as yaml from "js-yaml";

export function base64Encode(str) {
    // Convert the string to a Uint8Array
    const utf8Bytes = new TextEncoder().encode(str);

    // Convert the Uint8Array to a string of ASCII characters
    let asciiStr = '';
    for (let byte of utf8Bytes) {
        asciiStr += String.fromCharCode(byte);
    }

    // Encode the ASCII string as base64
    return btoa(asciiStr);
}

function getSecretFilePath() {
    return path.join(fileService.getProjectRootFolder(), 'assets','k8s', 'secret.yaml');
}


function envToJson(filePath) {
    try {
        // Read the contents of the file
        const fileContents = fs.readFileSync(filePath, 'utf8');

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
export async function createSecrets(appName,filePath){
    const entries = envToJson(filePath);
    const secrets = {}
    for (const [key, value] of entries) {
        secrets[key] = base64Encode(value)
    }
    const secretFilePath = getSecretFilePath();

    const template = await fileService.readFile(secretFilePath);
    const contents = ejs.render(template, {
        appName
    });

    const yamlInstance = yaml.load(contents);
    yamlInstance.data={}
    for (const [key, value] of secrets) {
        // secrets[key] = base64Encode(value)
        yamlInstance.data[key] = secrets[key]
    }
    const newContents = yaml.dump(yamlInstance);
    return newContents;

}
async function getK8sService() {
    const configPath = await appConfigHandler.loadDeployGateConfig();
    console.log('configPath', configPath);
const    {kubeConfigPath} = configPath
    const k8sService = new K8sService(kubeConfigPath);
    await k8sService.init();
    return k8sService;
}

export async  function isSecretExists(secretName) {
    const k8sService = await getK8sService();
    const secret = await k8sService.k8sCoreApi.readNamespacedSecret(secretName, 'default');
    return secret.body.metadata.name === secretName;
}

export async function createSecret(secretName, data) {
    const k8sService = await getK8sService();
    const secret = {
        metadata: {
            name: secretName
        },
        data: data
    };
    await k8sService.k8sCoreApi.createNamespacedSecret('default', secret);
}
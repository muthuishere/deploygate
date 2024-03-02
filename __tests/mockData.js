import {fileURLToPath} from "url";
import Path from "path";

export const processArgs = [
    '',
    '/deploygate/bin/init_config.js'
]


export const  domainName =  process.env.DOMAIN_NAME || "something.com" ;
export const testDomainName = "test." + domainName;
export const testRedirectPort =9898;


 const options = {
    domainName: testDomainName,
    redirectPort: testRedirectPort,
    enableSSL: true
};
 const config = {
    "remoteServerAlias": process.env.REMOTE_SERVER_ALIAS || "test@something.com",
    "ansibleHostName": process.env.ANSIBLE_HOST_NAME ||"something.com",
    "customRegistryUrl": process.env.CUSTOM_REGISTRY_URL ||"registry.something.com",
    "customRegistryCredentialsName": process.env.CUSTOM_REGISTRY_CREDENTIALS_NAME ||"temp-credentials",
    "kubeNamespace": process.env.KUBE_NAMESPACE ||"default",
    "kubeConfigPath": process.env.KUBE_CONFIG_PATH ||""
};



export function getOptions(){
    return {...options};
}

/**
 *
 * @returns {customRegistryCredentialsName, kubeNamespace, remoteServerAlias, kubeConfigPath, ansibleHostName, customRegistryUrl}
 */
export function getConfig(){
    return {...config};

}

export function getProcessArgs(){
    return processArgs;
}
export function getDomainName(){
    return domainName;
}
export function getEnvFile(){
    return process.env.ENV_FILE;
}



export function getProjectRootFolder() {
    const __filename = fileURLToPath(import.meta.url);
    const dirname = Path.dirname(__filename);
    const folder = Path.resolve(dirname, '../')
    return folder;
}

export function getEnvFilePath() {
    return Path.join(getProjectRootFolder(), 'assets','data', '.env.example');
}
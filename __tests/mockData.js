import Path from "path";
import files, {getProjectRootFolder} from "../src/shared/files.js";
import * as globalConfigHandler from "../src/config/globalConfigHandler.js";

export const processArgs = [
    '',
    '/deploygate/bin/init_config.js'
]

let obj= null;

export async function initTestEnv() {
    //copy the testdata.json.example to testdata.json
    const contents = await files.readFile(Path.join(getProjectRootFolder(),'testdata.json'));
    // console.log(contents);
    obj = JSON.parse(contents);
}


/**
 * @typedef {Object} TestDomainOptions
 * @property {string} domainName - The domain name for testing
 * @property {number} redirectPort - The redirect port number
 * @property {boolean} enableSSL - Whether SSL is enabled for testing
 */

/**
 *
 * @typedef {import('../src/config/globalConfigHandler.js').getGlobalConfig} DeployGateConfigPromise
 * @typedef {DeployGateConfigPromise} DeployGateConfig
 */

/**
 * @typedef {Object} NewProjectConfig
 * @property {string} appName - The name of the application
 * @property {string} projectRootFolder - The root folder of the project
 * @property {string} buildCommand - The command to build the application
 * @property {string} dockerFilePath - The path to the Dockerfile
 * @property {string} dockerImageTag - The tag for the Docker image
 * @property {string} appImageUrl - The URL for the application image
 * @property {number} appInternalPort - The internal port for the application
 * @property {number} replicas - The number of replicas for the application
 * @property {string} kubernetesConfigOutputFolder - The output folder for the Kubernetes config
 * @property {string} envFilePath - The path to the environment file
 * @property {string} domainName - The domain name for the new project
 * @property {number} nodePort - The node port number
 * @property {boolean} enableSSL - Whether SSL is enabled for the new project
 */


/**
 * @typedef {Object} GitFolders
 * @property {string} cleanGitFolder - The clean git folder
 * @property {string} dirtyGitFolder - The dirty git folder
 * @property {string} noGitFolder - The folder without git
 */
//    "registryUrl": "registry.muthuishere.com",
//     "username": "mydocker",
//     "password": "mydocker",
//     "email": "muthu@deemwar.com",
//     "secretName": "registry-credentials"

/**
 * @typedef {Object} DockerRegistrySecret
 * @property {string} registryUrl - The URL for the registry
 * @property {string} username - The username for the registry
 * @property {string} password - The password for the registry
 * @property {string} email - The email for the registry
 * @property {string} secretName - The name for the secret
 */

/**
 * @typedef {Object} TestData
 * @property {TestDomainOptions} testDomainOptions - The options for testing the domain
 * @property {DockerRegistrySecret} dockerRegistrySecret - The options for testing the domain
 * @property {DeployGateConfig} deployGateConfig - The configuration for the deployment gate
 * @property {NewProjectConfig} newProjectConfig - The configuration for the new project
 * @property {GitFolders} gitFolders - The folders for testing git
 */

/**
 * Get the test configuration
 * @returns {TestData}
 */
export function getTestConfig(){
    return structuredClone(obj);
}
/**
 *
 * @returns TestDomainOptions
 */
export function getDomainOptions(){
    return  getTestConfig().testDomainOptions
}
/**
 *
 * @returns NewProjectConfig
 */
export function getNewProjectConfig(){
    return  getTestConfig().newProjectConfig

}

/**
 *
 * @returns DeployGateConfig
 */
export function getGlobalConfig(){
    const testConfig = getTestConfig();
    // console.log(testConfig);
    return  testConfig.deployGateConfig

}

export function getProcessArgs(){
    return processArgs;
}

export function getEnvFile(){
    return process.env.ENV_FILE;
}





export function getEnvFilePath() {
    return Path.join(getProjectRootFolder(),"__tests", 'assets', '.env.example');
}
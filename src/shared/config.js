import path from 'path';
import os from "os";
import fs from 'fs';


import 'dotenv/config'
import chalk from "chalk";
import * as k8s from "@kubernetes/client-node";







export const getKubernetesConfigFile = () => {

    if (process.env.KUBERNETES_CONFIG_FILE) {
        return process.env.KUBERNETES_CONFIG_FILE;
    }

    return readFromConfigFile('KUBERNETES_CONFIG_FILE');
};


function readFromConfigFile(key) {
    const credentials = readConfigFile();
    return credentials[key];
}

function readConfigFile() {
    try {
        const configFile = fs.readFileSync(CONFIG_PATH, 'utf8');
        const credentials = JSON.parse(configFile);
        return credentials;
    } catch (error) {
        return {};
    }
}

function saveConfig(credentials) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(credentials));
    console.log(chalk.green('Credentials saved successfully.'));
}

export const saveGithubToken = (githubToken) => {

    const existingData = readConfigFile();
    const configData = {...existingData, GITHUB_TOKEN: githubToken};
    saveConfig(configData);
};

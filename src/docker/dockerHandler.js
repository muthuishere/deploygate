import {executeDockerCommandWith} from "./dockerService.js";
import {getAsJson} from "../shared/files.js";
import path from "path";
import chalk from "chalk";

export async function handleBuildImage({appName, dockerImageTag, dockerFilePath}) {

    return  await executeDockerCommandWith(['build', '-t', `${appName}:${dockerImageTag}`, '-f', dockerFilePath, '.']);


}
export async function handleTagImage({appName, dockerImageTag, dockerRegistryUrl}) {

return      await executeDockerCommandWith(['tag',  `${appName}:${dockerImageTag}`, `${dockerRegistryUrl}/${appName}:${dockerImageTag}`]);


}
export async function handlePushToRegistry({appName, dockerRegistryUrl, dockerImageTag}) {


    return await executeDockerCommandWith(['push', `${dockerRegistryUrl}/${appName}:${dockerImageTag}`]);


}

export async function handleBuildAndPushImage({appName, dockerImageTag, dockerFilePath, dockerRegistryUrl}) {

    console.log(chalk.yellowBright("Building  Container"))
    const buildResults = await handleBuildImage({appName, dockerImageTag, dockerFilePath});
    const dockerImageTagResults = await handleTagImage({appName, dockerImageTag, dockerRegistryUrl});
    console.log(chalk.yellowBright(`Pushing Container to ${dockerRegistryUrl}`))
    const pushResults  = await handlePushToRegistry({appName, dockerRegistryUrl, dockerImageTag});
    if(pushResults.code !== 0){
        throw new Error(`Error pushing image to dockerRegistryUrl ${pushResults.stderr.join('\n')}`)
    }
    console.log(chalk.green(`Succesfully Pushed Container to ${dockerRegistryUrl}`))
    return {
        buildResults,
        dockerImageTagResults,
        pushResults
    }
}


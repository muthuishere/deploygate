import {executeDockerCommandWith} from "./dockerService.js";

export async function handleBuildImage({appName, tag, dockerFile}) {

    return  await executeDockerCommandWith(['build', '-t', `${appName}:${tag}`, '-f', dockerFile, '.']);


}
export async function handleTagImage({appName, tag, registry}) {

return      await executeDockerCommandWith(['tag',  `${appName}:${tag}`, `${registry}/${appName}:${tag}`]);


}
export async function handlePushToRegistry({appName, registry, tag}) {

    return await executeDockerCommandWith(['push', `${registry}/${appName}:${tag}`]);


}

export async function handleBuildAndPushImage({appName, tag, dockerFile, registry}) {

    const buildResults = await handleBuildImage({appName, tag, dockerFile});
    const tagResults = await handleTagImage({appName, tag, registry});
    const pushResults  = await handlePushToRegistry({appName, registry, tag});
    if(pushResults.code !== 0){
        throw new Error(`Error pushing image to registry ${pushResults.stderr.join('\n')}`)
    }
    return {
        buildResults,
        tagResults,
        pushResults
    }
}
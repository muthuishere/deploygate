import {deleteFile, getRandomtempYamlFileName} from "../shared/files.js";
import fileService from "../shared/files.js";
import {runProcess} from "../shared/system_processor.js";
import {PlaybookResult} from "./PlaybookResult.js";
import {exec} from "child_process";

// export async function runPlayBookFile(filename) {
//
//
//     const response = await runProcess("ansible-playbook", [filename, '-vv']);
//     return response;
// }


async function runPlaybookFileold(filename) {
    const response = await runProcess("ansible-playbook", [filename, '-vv']);
    const tasks = processAnsibleOutput(response.stdout);
    const overallStatus = determineOverallStatus(response.stderr, tasks);
    let errorDetails = tasks.filter(task => task.status === 'Failed').map(task => task.stderr)
    if (overallStatus === 'Failed') {

        throw new Error(`Playbook execution failed: ${errorDetails.join('\n')}`);
    }

    return new PlaybookResult(tasks);
}


async function runPlaybookFile(playbookPath) {
    console.log("Running Ansible playbook file",playbookPath)

    const response = await runProcess("ansible-playbook", [playbookPath, '-vv']);

    if(response.stderr.length > 0){
        // console.log("running playbook file failed",response)
        throw new Error(`Ansible Playbook execution failed: ${response.stderr.join('\n')}`);
    }
    console.log("Running Ansible playbook file completed",response)
    return response;


}

/**

 * @returns {Promise<PlaybookResult>}
 * @param playbook
 */

export async function runPlayBookContents(contents) {

    let filename = null


        filename = getRandomtempYamlFileName();
    await fileService.writeFile(filename, contents);

    try {
        return await runPlaybookFile(filename);
    } catch (e){

        throw e;

    } finally {



            await deleteFile(filename);


    }


}

function determineOverallStatus(stderr, tasks) {
    const anyTaskFailed = tasks.some(task => task.status === 'Failed');
    return anyTaskFailed || stderr.length > 0 ? 'Failed' : 'Success';
}

export function processAnsibleOutput(outputLines) {
    const taskResults = [];
    let currentTask = {name: '', output: [], status: 'Unknown', stdout: '', stderr: ''};

    // console.log(" processAnsibleOutput line")
    // console.log(outputLines)
    // console.log(" processAnsibleOutput line completed")
    outputLines.forEach(line => {
        console.log(line)
        if (line.startsWith("TASK [")) {
            if (currentTask.name && currentTask.status !== 'Unknown') {
                taskResults.push(currentTask);
            }
            currentTask = {name: extractTaskName(line), output: [], status: 'Unknown', stdout: '', stderr: ''};
        } else if (line.includes('fatal:') || line.includes('FAILED!')) {
            console.log("fatal line" + line)
            currentTask.status = 'Failed';
            currentTask.output.push(line);
            const {stdout, stderr} = extractOutputFromChangedLine(line);
            currentTask.stdout = stdout;
            currentTask.stderr = stderr;
        } else if (line.includes('changed:')) {
            console.log("changed line" + line)
            currentTask.status = 'Success';
            const {stdout, stderr} = extractOutputFromChangedLine(line);
            currentTask.stdout = stdout;
            // currentTask.stderr = stderr;
            console.log("changed line" + JSON.stringify(currentTask))
        } else if (currentTask.name) {
            currentTask.output.push(line);
        }
    });

    console.log("finally" + JSON.stringify(currentTask))
    // if (currentTask.name) {
    //     if (currentTask.stderr.length > 0) {
    //         currentTask.status = 'Failed';
    //     }
    //
    //
    //     taskResults.push(currentTask);
    // }

    return taskResults;
}


function extractOutputFromChangedLine(line) {
    try {
        const jsonStart = line.indexOf('{"');
        const jsonEnd = line.lastIndexOf('}');
        const jsonStr = line.substring(jsonStart, jsonEnd + 1);
        const jsonData = JSON.parse(jsonStr);
        return {
            stdout: jsonData.stdout || '',
            stderr: jsonData.stderr || '',
            rc: jsonData.rc || -1 // Extract return code
        };
    } catch (error) {
        console.error("Error parsing JSON in changed line:", error);
        return {stdout: '', stderr: '', rc: -1};
    }
}


function extractTaskName(taskLine) {
    const match = taskLine.match(/TASK \[(.*?)\]/);
    return match ? match[1] : 'Unknown Task';
}
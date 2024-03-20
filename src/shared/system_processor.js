import {spawn} from 'child_process'
import commandExists from "command-exists";
import {fileURLToPath} from "url";
import Path from "path";
import path from "path";
import logger from "./logger.js";
import {promises as fsPromise} from "fs";

const activeProcesses = new Set();
const isWin = process.platform === "win32";

export function runProcessFromFolder(folderPath,command, args){
 return runProcess(command, args, { cwd: folderPath });
}



/**
 * Executes a given command with specified arguments and options, handling the output with optional callbacks.
 *
 * @param {string} command - The command to be executed.
 * @param {string[]} args - An array of strings representing the arguments to be passed to the command.
 * @param {Object} [options={}] - An object specifying node's child_process.spawn options.
 * @param {function(string):void} [stdoutHandler=() => {}] - An optional callback function that is called with the output data from the command's stdout.
 * @param {function(string):void} [stderrHandler=() => {}] - An optional callback function that is called with the output data from the command's stderr.
 * @returns {Promise<Object>} A promise that resolves to an object containing the stdout, stderr, and exit code of the command.
 *
 * @example
 * runProcess('ls', ['-lh', '/usr'], {},
 *   data => console.log(`STDOUT: ${data}`),
 *   data => console.error(`STDERR: ${data}`)
 * ).then(result => {
 *   console.log('Process completed with code:', result.code);
 * }).catch(err => {
 *   console.error('Process failed:', err);
 * });
 */
export function runProcess(command, args, options = {}, stdoutHandler = () => {}, stderrHandler = () => {}) {
    logger.debug(`Running command: ${command} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        const process = spawn(command, args,options);

        let stdoutData = [];
        let stderrData = [];

        process.stdout.on('data', (data) => {
            stdoutData.push(...data.toString().split(/\r?\n/));
            stdoutHandler(data.toString()); // Invoke stdout handler
            // console.log(data.toString());
            logger.debug(data.toString());
        });

        process.stderr.on('data', (data) => {
            stderrData.push(...data.toString().split(/\r?\n/));
            stderrHandler(data.toString()); // Invoke stderr handler
            // console.error(data.toString());
            logger.error(data.toString());
        });

        process.on('close', (code) => {
            // Remove any empty lines that might have been added at the end
            stdoutData = stdoutData.filter(line => !!line);
            stderrData = stderrData.filter(line => !!line);
            activeProcesses.delete(process);

            resolve({
                stdout: stdoutData,
                stderr: stderrData,
                code: code
            });
        });

        process.on('error', (err) => {
            reject(err);
        });
        activeProcesses.add(process);

    });
}

process.on('SIGINT', () => {
    console.log('Interrupt detected. Terminating processes...');

    // Terminate all active child processes
    for (const proc of activeProcesses) {
        proc.kill();
    }

    // Exit after a short delay to allow processes to terminate gracefully
    setTimeout(() => {
        console.log('Exiting...');
        process.exit();
    }, 500); // Adjust this delay as needed
});


export function isSudo() {

    return isWin ? true : (process.getuid && process.getuid() === 0);
}


export async function doesOsHasCommand(cmd) {
    try {
        await commandExists(cmd)
        return true
    } catch (e) {
        return false
    }


}

export function getHomeFolder() {
    const __filename = fileURLToPath(import.meta.url);
    const dirname = Path.dirname(__filename);
    const folder = Path.resolve(dirname, '../../')
    return folder;
}

export async function makeScriptsExecutable(folderName) {
    try {
        // Read all files in the directory
        const files = await fsPromise.readdir(folderName);

        // Filter out only .sh files
        const shFiles = files.filter(file => path.extname(file) === '.sh');

        // Loop through the .sh files and change them to be executable
        for (const file of shFiles) {
            const filePath = path.join(folderName, file);
            // Use runProcess to run `chmod +x` on the file
            await runProcess('chmod', ['+x', filePath]);
            console.log(`${file} is now executable`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function createSSHCommand(userRemoteHost, scriptContents) {
    // Escape backticks and $ in scriptContents for use in a template literal
    const escapedScript = scriptContents.replace(/`|\$/g, '\\$&');

    // Construct the SSH command
    const sshCommand = `ssh ${userRemoteHost} bash <<'EOF'\n${escapedScript}\nEOF`;

    return sshCommand;
}

export function getWorkingFolderName() {
    const cwd = process.cwd();
    return path.basename(cwd);

}

function loadEnvFromJson(filePath) {

    return new Promise((resolve, reject) => {
        // Read the file
        // Read the file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading the file:", err);
                reject(err);
                return;
            }

            try {
                // Parse JSON
                const jsonData = JSON.parse(data);

                // Iterate over keys and set them in process.env
                Object.keys(jsonData).forEach(key => {
                    process.env[key] = jsonData[key];
                });

                console.log("Environment variables loaded successfully.");
                resolve();
            } catch (parseErr) {
                reject(parseErr);
                console.error("Error parsing JSON:", parseErr);
            }
        });
    });
}
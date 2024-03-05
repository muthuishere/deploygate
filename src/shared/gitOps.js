import {runProcess} from "./system_processor.js";
import logger from "./logger.js";
import path from "path";

/**
 * Check if the Git status is clean in a given folder.
 * @param {string} folderPath - The path to the folder to check.
 * @returns {Promise<boolean>} - Promise that resolves to true if clean, false otherwise.
 */
export async function isGitStatusClean(folderPath) {


        if(fs.existsSync(folderPath) === false){
            throw new Error(`Folder does not exist: ${folderPath}`);
        }
        const gitFolderPath = path.join(folderPath, '.git');
        if (fs.existsSync(gitFolderPath) === false) {
            throw new Error(`Folder is not a git repository: ${folderPath}`);
        }
    try {
        // Run git status command with specified working directory
        const result = await runProcess('git', ['status', '--porcelain'], { cwd: folderPath });

        // logger.debug('Git status result:', result);
        if (result.stderr && result.stderr.length > 0) {
            throw new Error(`Git error: ${result.stderr.join('\n')}`);
        }

        // If stdout is empty, there are no changes
        return result.stdout.length === 0;
    } catch (error) {
        logger.error('Failed to check git status:', error);
        throw error;
    }
}

export function isValidGitRepo(folderPath) {
    const gitFolderPath = path.join(folderPath, '.git');
    return fs.existsSync(gitFolderPath);
}
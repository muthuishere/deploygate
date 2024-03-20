import * as fs from "fs";
import path from "path";
import os from "os";
import {v4 as uuidv4} from "uuid";
import {fileURLToPath} from "url";
/**
 * Writes content to a file.
 * @param {string} path - The path of the file.
 * @param {string} content - The content to write.
 * @returns {Promise<void>}
 */
export async function writeFile(path, content) {


    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, err => {
            if (err) {
                reject(err);
            }
            resolve();
            // file written successfully
        });
    })


}

/**
 * Reads content from a file.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string>} The content of the file.
 */
export async function readFile(filename) {

    return new Promise((resolve, reject) => {
        fs.readFile(filename, "utf8", function (err, data) {

            if (err) {
                reject(err);
            }
            resolve(data);

        });
    });


}
/**
 * Checks if a file exists.
 * @param {string} filePath - The path of the file.
 * @returns {boolean} True if the file exists, false otherwise.
 */
 function fileExists(filePath) {
    return fs.existsSync(filePath);
}
/**
 * Gets the content of a file or an empty string if the file does not exist.
 * @param {string} filePath - The path of the file.
 * @returns {Promise<string>} The content of the file or an empty string.
 */
async function getFileContentOrEmpty(filePath) {

        if (fs.existsSync(filePath)) {
            const content = await readFile(filePath, 'utf8');
            return content;
        }

    return '';
}
/**
 * Deletes a file.
 * @param {string} filename - The name of the file.
 * @returns {Promise<void>}
 */
export async function deleteFile(filename) {

    return new Promise((resolve, reject) => {


        try {

            if (fs.existsSync(filename) == false) {
                throw new Error("File does not exist: " + filename);

            }


            fs.rmSync(filename, {
                force: true,
            });


            resolve();
        } catch (e) {
            console.log("Error deleting file: " + filename);
            console.error(e)
            reject(e);
        }


    });


}
/**
 * Creates a folder.
 * @param {string} path - The path of the folder.
 * @returns {Promise<void>}
 */
export async function createFolder(path) {

    return new Promise((resolve, reject) => {

        if (fs.existsSync(path)) {
            resolve();
        }

        fs.mkdir(path, {recursive: true}, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });


    });


}
/**
 * Checks if a folder exists.
 * @param {string} path - The path of the folder.
 * @returns {boolean} True if the folder exists, false otherwise.
 */
export function folderExists(path) {
    try {
        // Use fs.statSync to get file system statistics
        const stats = fs.statSync(path);

        // Check if the path is a directory
        return stats.isDirectory();
    } catch (error) {
        // If an error is thrown, it means the path does not exist
        return false;
    }
}
/**
 * Gets the absolute path of a file or folder.
 * @param {string} input - The relative or absolute path.
 * @returns {string} The absolute path.
 */
export function getAbsolutePath(input) {
    if(path.isAbsolute(input)){
        return input;
    }else {
        return path.join(process.cwd(),input);

    }

}

/**
 * Creates a symbolic link.
 * @param {string} path - The path of the symbolic link.
 * @param {string} link - The path that the symbolic link points to.
 * @returns {Promise<void>}
 */
export async function createSymbolicLink(path, link) {

    return new Promise((resolve, reject) => {

        if (fs.existsSync(link)) {
            resolve();
        }


        fs.symlink(link, path, "file", err => {
            if (err) {
                reject(err);
            }
            resolve();
        });

    });


}

/**
 * Generates a random temporary file name.
 * @param {string} extension - The extension of the file.
 * @returns {string} The generated file name.
 */
export function getRandomTempFileName(extension) {

    let filePath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);
    return filePath;
}

/**
 * Generates a random temporary YAML file name.
 * @returns {string} The generated file name.
 */
export function getRandomtempYamlFileName() {
    return getRandomTempFileName("yaml");
}

/**
 * Generates a random temporary JSON file name.
 * @returns {string} The generated file name.
 */
export function getRandomtempJsonFileName() {
    return getRandomTempFileName("json");
}

/**
 * Generates a random temporary shell script file name.
 * @returns {string} The generated file name.
 */
export function getRandomtempShFileName() {
    return getRandomTempFileName("sh");
}

/**
 * Gets the root folder of the project.
 * @returns {string} The path of the root folder.
 */
export function getProjectRootFolder() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, "../../");
}

/**
 * Deletes and recreates a folder.
 * @param {string} deliveryFolder - The path of the folder.
 */
export function cleanAndCreateFolder(deliveryFolder) {
    if (fs.existsSync(deliveryFolder)) {
        fs.rmSync(deliveryFolder, {recursive: true})
    }
    fs.mkdirSync(deliveryFolder, {recursive: true})
}

/**
 * Gets the name of the delivery folder.
 * @param {string} appName - The name of the app.
 * @returns {string} The name of the delivery folder.
 */
export function getDeliveryFolderName(appName) {

    const deliveryFolder = path.join(getProjectRootFolder(), 'dist', appName);

    return deliveryFolder;
}

/**
 * Gets the content of a JSON file.
 * @param {string} jsonFilePath - The path of the JSON file.
 * @returns {Promise<Object>} The content of the JSON file.
 */
export async function getAsJson(jsonFilePath) {


    if (fileExists(jsonFilePath) === false) {
        throw ` file  ${jsonFilePath} does not exists`;
    }

    const configContents = await readFile(jsonFilePath);
    return JSON.parse(configContents);
}



// export default {
//     deleteFile:deleteFile,
//     writeFile:writeFile,
//     readFile:readFile,
//     fileExists:fileExists,
//     createFolder:createFolder,
//     folderExists:folderExists,
//     getFileContentOrEmpty:getFileContentOrEmpty,
//
//     getProjectRootFolder:getProjectRootFolder
// }
//
export default {
    deleteFile,
    writeFile,
    readFile,
    fileExists,
    createFolder,
    folderExists,
    getFileContentOrEmpty,
    getProjectRootFolder
}
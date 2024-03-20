import {hideBin} from 'yargs/helpers';
import yargs from 'yargs/yargs';
import {toJson} from "./utils.js";
import inquirerService from "./inquirerService.js";


export function hasAllOptionsSet(existingargv, cliOptions) {


    return Object.entries(cliOptions)
        .filter(([key, value]) => value.demandOption)
        .map(([key, value]) => key)
        .every(key => existingargv.hasOwnProperty(key))

}

export function getProvidedOptions(existingargv, cliOptions) {


    return Object.entries(cliOptions)
        .filter(([key, value]) => existingargv.hasOwnProperty(key))
        .map(([key, value]) => {
            return {[key]: existingargv[key]}
        }).reduce((acc, curr) => {
            return {...acc, ...curr}
        },{});

}

export function removeProvidedOptions(existingargv, cliOptions) {
    return Object.entries(cliOptions)
        .filter(([key, value]) => existingargv.hasOwnProperty(key) === false)
        .map(([key, value]) => {
            return {[key]: value}
        }).reduce((acc, curr) => {
            return {...acc, ...curr}
        });
}


export function getDefaultValues(cliOptions) {

    return Object.entries(cliOptions)
        .filter(([key, value]) => Object.hasOwn(value, "default"))
        .map(([key, value]) => {
            return {[key]: value.default}
        }).reduce((acc, curr) => {
            return {...acc, ...curr}
        });


}

export function hasHelpOrVersion(processArgs) {
    return processArgs
        .slice(2)
        .filter(arg => arg.indexOf("help") > 0 || arg.indexOf("version") > 0)
        .length > 0;
}

function filterOnlyValidInputs(inputs, cliOptions) {

    const defaultValues = getDefaultValues(cliOptions);

    let formattedInputs = {...defaultValues, ...inputs}

    formattedInputs = Object.entries(formattedInputs)
        .filter(([key, value]) => Object.keys(cliOptions).includes(key))
        .reduce(toJson, {});

    for (const key in inputs) {
        if (defaultValues.hasOwnProperty(key)) {
            const defaultValue = defaultValues[key];
            const inputValue = inputs[key];

            if (typeof defaultValue === 'boolean') {
                formattedInputs[key] = Boolean(inputValue);
            } else if (typeof defaultValue === 'number') {
                formattedInputs[key] = Number(inputValue);
            } else {
                formattedInputs[key] = inputValue;
            }
        }
    }
    return formattedInputs;
}

// 3 months no angry , 3 months  afternoon 1 hour , 3 months only

// jogging
//

/*
/**
 * @param {any[]} processArgs - The process arguments
 * @param {Object} cliOptions - The command line options
 * @returns {Promise<Object>} - The promise that resolves with a dynamic JSON object
 */
export async function getProcessedCommandLineParameters(processArgs, commandLineOptions) {


    if (hasHelpOrVersion(processArgs)) {
        yargs(hideBin(processArgs)).usage('Usage: npx $0').options(commandLineOptions).help().version().argv;
        process.exit(0);
        return
    }

    let inputs = yargs(hideBin(processArgs)).argv;


    if (hasAllOptionsSet(inputs, commandLineOptions)) {

        const cliInputs = filterOnlyValidInputs(inputs, commandLineOptions);
        // console.log("cliInputs direct", cliInputs)
        return cliInputs;
    }

    console.log("existing inputs ", inputs)
    console.log("existing commandLineOptions ", commandLineOptions)


    const existingInputs = getProvidedOptions(inputs, commandLineOptions);
    // console.log("existingOptions" , existingInputs)
    const filteredCliOptions = removeProvidedOptions(inputs, commandLineOptions);
    inputs = await inquirerService.getInteractiveInputs(filteredCliOptions);
    // console.log("inputs from inquirer", inputs)
    const cliInputs = filterOnlyValidInputs(inputs, commandLineOptions);
    // console.log("mergedInputs", mergedInputs)
    return {...existingInputs, ...cliInputs};


}

export default {
    /**
     * @see getProcessedCommandLineParameters
     */

    getProcessedCommandLineParameters: getProcessedCommandLineParameters,
}
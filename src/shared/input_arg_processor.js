import {hideBin} from 'yargs/helpers';
import yargs from 'yargs/yargs';
import {toJson} from "./utils.js";
import  inquirerService from "./inquirerService.js";


export function hasAllOptionsSet(existingargv, cliOptions) {

    return Object.entries(cliOptions)
        .filter(([key, value]) => value.demandOption)
        .map(([key, value]) => key)
        .every(key => existingargv.hasOwnProperty(key))

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

   let formattedInputs= {...defaultValues, ...inputs}

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
return     formattedInputs;
}
export async function getParametersBasedOnOptions(processArgs, cliOptions) {

    console.log("processArgs", processArgs)

    if (hasHelpOrVersion(processArgs)) {
        yargs(hideBin(processArgs)).usage('Usage: npx $0').options(cliOptions).help().version().argv;
        return
    }


    let inputs = yargs(hideBin(processArgs)).argv;

    // console.log("input args" ,inputs)

    if (hasAllOptionsSet(inputs, cliOptions) === false) {
        inputs = await inquirerService.getInteractiveInputs(cliOptions);
        // console.log("inputs from inquirer", inputs)


    }


    const validInputs = filterOnlyValidInputs(inputs, cliOptions);

    return validInputs;
}

export default {
    getParametersBasedOnOptions: getParametersBasedOnOptions,
}
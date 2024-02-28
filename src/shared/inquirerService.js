import inquirer from "inquirer";
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";

 async function getInteractiveInputs(cliOptions) {
    const answers = await inquirer.prompt(Object.values(cliOptions));
    Object.entries(answers).forEach(([key, value]) => {
        value && process.argv.push(`--${key}`, value);
    });
    return yargs(hideBin(process.argv))
        .usage('Usage: npx $0')
        .options(cliOptions)
        .parseSync();
}

async function confirmAction(message) {
    const answer = await inquirer.prompt([{
        type: 'confirm',
        message: message,
        name: 'confirm',
    }]);
    return answer.confirm;
}

// const exports = {
//     getInteractiveInputs
// };
// export default exports;

export default {
    getInteractiveInputs: getInteractiveInputs,
    confirmAction: confirmAction
}
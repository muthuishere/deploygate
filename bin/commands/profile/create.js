export const command = 'profile create';
export const desc = 'Create a new profile';

// Define options for the create command
export const builder = (yargs) => yargs.option({
    // Define your options here
});

// Your create logic here
export const handler = async (argv) => {
    console.log('Creating profile...', argv);
};

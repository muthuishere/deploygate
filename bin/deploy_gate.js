#!/usr/bin/env node
import chalk from "chalk";
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
import * as profileHandler from "../src/config/profileHandler.js";
import {profileNameOptions} from "../src/config/profileHandler.js";




(async () => {


    try {

        const processArgs = process.argv;

//        yargs(hideBin(process.argv))
//             .command('auth login', 'Login application', (yargs) => yargs, async (argv) => {
//                 // remove 'auth' and 'login' from argv
//
//                 const processArgs = structuredClone(process.argv);
//                 console.log(processArgs);
//                 delete processArgs[1];
//                 delete processArgs[2];
//                 await authLogin(processArgs);
//             })
//             .command('projects create', 'create Project', (yargs) => yargs, async (argv) => {
//                 // remove 'projects' and 'create' from argv
//                 delete argv._[0];
//                 delete argv._[1];
//                 await createProjects(argv);
//             })
//             .demandCommand(1)
//             .help() // Enable the built-in help
//             .argv;



        //        yargs(hideBin(process.argv))
        //             .command('profile create', 'Create Global Profile', (yargs) => yargs.options(profileHandler.createProfileOptions), async (argv) => {
        //                 // remove 'auth' and 'login' from argv
        //                 console.log('Creating profile...');
        //
        //                 // const processArgs = structuredClone(process.argv);
        //                 await profileHandler.handleCreateProfile(process.argv);
        //
        //             })
        //             .command('profile update', 'Update Global Profile', (yargs) => yargs.options(profileHandler.updateProfileOptions), async (argv) => {
        //                 console.log('update profile...');
        //                 await profileHandler.handleUpdateProfile(process.argv);
        //             })
        //             .demandCommand(1)
        //             .help() // Enable the built-in help
        //             .argv;



        yargs(hideBin(process.argv))
            .command('profile', 'Global Profile Options', async function (inputYargs) {
                return inputYargs
                    .command('create', 'create global profile',(yargs) => yargs.options(profileHandler.createProfileOptions), async function () {
                        console.log('create global profile in...');
                        await profileHandler.handleCreateProfile(process.argv);
                    })
                    .command('update', 'update global profile', (yargs) => yargs.options(profileHandler.profileNameOptions),async function () {
                        console.log('update global profile out...');
                        await profileHandler.handleUpdateProfile(process.argv);
                    })
                    .command('delete', 'delete global profile', (yargs) => yargs.options(profileHandler.profileNameOptions),async function () {
                        console.log('update global profile out...');
                        await profileHandler.handleDeleteProfile(process.argv);
                    });

            })
            .demandCommand(1)
            .help() // Enable the built-in help
            .argv;


    } catch (err) {

        console.error(chalk.red("Error Creating Domain"), err);
        // console.error(err);
        process.exit(1);
    }

})();

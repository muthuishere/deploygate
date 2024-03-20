#!/usr/bin/env node
// Import necessary modules

import {handleRemoveConfig} from "../src/config/globalConfigHandler.js";

// Handle the create-domain command

(async () => {


    try {

        const processArgs = process.argv;


        await handleRemoveConfig(processArgs)

        // await createStaticDomain(inputs);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

})();

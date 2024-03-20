#!/usr/bin/env node
// Import necessary modules
import {handleCreateDomainCommand} from "../src/domain/domainCreateHandler.js";

// Handle the create-domain command



(async () => {

    await handleCreateDomainCommand(process.argv);

})();

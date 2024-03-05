import 'dotenv/config'
import {initTestEnv} from "./mockData.js";
process.env.LOG_LEVEL = 'debug'
before(async () => {
    console.log("async mocha.setup.js")
    await    initTestEnv();

    console.log("async mocha.setup.js done")
})

export async function mochaGlobalSetup() {
    console.log("mocha.setup.js")
}
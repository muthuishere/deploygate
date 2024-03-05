import * as dockerHandler from './dockerHandler.js';
import {expect} from "chai";
import {getTestConfig} from "../../__tests/mockData.js";

describe('Docker Handler tests', () => {

    it('should create a docker container', async () => {
              const testConfig =getTestConfig()
        const dockerFilePath= testConfig.newProjectConfig.dockerFilePath
        const dockerRegistryUrl= testConfig.deployGateConfig.customRegistryUrl
        const appName = 'test'
        const dockerImageTag = 'latest'



       const contents = await dockerHandler.handleBuildAndPushImage({appName, dockerImageTag, dockerFilePath, dockerRegistryUrl})
         console.log(contents)
       expect(contents).to.be.an('object');
        
    });

});
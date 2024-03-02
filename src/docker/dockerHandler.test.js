import * as dockerHandler from './dockerHandler.js';
import {expect} from "chai";

describe('Docker Handler tests', () => {

    it('should create a docker container', async () => {
        // DOCKER_REGISTRY_URL=registry.muthuishere.com
        // SAMPLE_DOCKER_FILE_PATH=/Users/muthuishere/muthu/gitworkspace/infrastructure/cloudnativeprojects/hello-node/Dockerfil
        const dockerFile= process.env.SAMPLE_DOCKER_FILE_PATH
        const dockerRegistryUrl= process.env.DOCKER_REGISTRY_URL
        const appName = 'test'
        const tag = 'latest'
       const contents = await dockerHandler.handleBuildAndPushImage({appName, tag, dockerFile, registry: dockerRegistryUrl})
         console.log(contents)
      expect(contents).to.be.an('object');
        
    });
});
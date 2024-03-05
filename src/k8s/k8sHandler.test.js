import {expect} from "chai";
import  * as k8sHandler from './k8sHandler.js';
import {handleGenerateK8sAppConfig} from "./k8sHandler.js";
import * as mockData from "../../__tests/mockData.js";
describe('k8sHandler.test', () => {


    describe('isDeploymentExists Tests', () => {

        it('isDeploymentExists should return true for valid deployment', async () => {
            const deploymentExists = await k8sHandler.isDeploymentExistsForApp('testapp');
            expect(deploymentExists).to.equal(true);
        });
        it('isDeploymentExists should return false for invalid deployment', async () => {
            const deploymentExists = await k8sHandler.isDeploymentExistsForApp('invalid');
            expect(deploymentExists).to.equal(false);
        });
    })

    describe('isServiceExists Tests', () => {

        it('isServiceExists should return true for valid ', async () => {
            const deploymentExists = await k8sHandler.isServiceExistsForApp('testapp');
            expect(deploymentExists).to.equal(true);
        });
        it('isServiceExists should return false for invalid ', async () => {
            const deploymentExists = await k8sHandler.isServiceExistsForApp('invalid');
            expect(deploymentExists).to.equal(false);
        });
    })
    describe('handleGenerateK8sAppConfig Tests', () => {

        it('handleGenerateK8sAppConfig should return true for valid ', async () => {

            // const projectRootFolder = process.cwd();
           const input= mockData.getTestConfig().newProjectConfig

            const deploymentExists = await k8sHandler.handleGenerateK8sAppConfig(input);
            console.log(deploymentExists);

        });

        it('handleDeleteK8sAppConfig should return true for valid ', async () => {

            // const projectRootFolder = process.cwd();
           const input= {
               projectRootFolder:  mockData.getTestConfig().newProjectConfig.projectRootFolder,

           }

            const deploymentExists = await k8sHandler.handleDeleteK8sAppConfig(input);
            console.log(deploymentExists);

        });



        it('isServiceExists should return false for invalid ', async () => {
            const deploymentExists = await k8sHandler.isServiceExistsForApp('invalid');
            expect(deploymentExists).to.equal(false);
        });
    })
});
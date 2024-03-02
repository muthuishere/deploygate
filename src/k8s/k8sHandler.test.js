import {expect} from "chai";
import  * as k8sHandler from './k8sHandler.js';
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
});
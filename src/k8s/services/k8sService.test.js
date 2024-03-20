import {expect} from "chai";
import * as k8sService from "./k8sService.js";
import sinon from "sinon";
import globalConfigHandler from "../../config/globalConfigHandler.js";
import * as mockdata from "../../../__tests/mockData.js";

describe('k8sService', () => {

    let getGlobalConfigStub;
    beforeEach(() => {


        getGlobalConfigStub = sinon.stub(globalConfigHandler, 'getGlobalConfig');
        getGlobalConfigStub.resolves(mockdata.getGlobalConfig());
    });

    afterEach(() => {
        getGlobalConfigStub.restore();
    });


    it('should update current context', async () => {
        // add block here
        const currentContext = await k8sService.getCurrentContext();
        console.log(currentContext);
        expect(currentContext).to.be.a('string');

    });

    describe('isDeploymentExists Tests', () => {

        it('isDeploymentExists should return true for valid deployment', async () => {
            const deploymentExists = await k8sService.isDeploymentExistsForApp('testapp');
            expect(deploymentExists).to.equal(true);
        });
        it('isDeploymentExists should return false for invalid deployment', async () => {
            const deploymentExists = await k8sService.isDeploymentExistsForApp('invalid');
            expect(deploymentExists).to.equal(false);
        });
    })

    describe('isServiceExists Tests', () => {

        it('isServiceExists should return true for valid ', async () => {
            const deploymentExists = await k8sService.isServiceExistsForApp('testapp');
            expect(deploymentExists).to.equal(true);
        });
        it('isServiceExists should return false for invalid ', async () => {
            const deploymentExists = await k8sService.isServiceExistsForApp('invalid');
            expect(deploymentExists).to.equal(false);
        });
    })
});

import {expect} from "chai";
import globalConfigHandler from "../../config/globalConfigHandler.js";
import  * as k8sHandler from './k8sHandler.js';

import * as mockData from "../../../__tests/mockData.js";
import * as mockdata from "../../../__tests/mockData.js";
import sinon from "sinon";

describe('k8sHandler.test', () => {





    describe('handleGenerateK8sAppConfig Tests', () => {

        let getGlobalConfigStub;
        beforeEach(() => {


            getGlobalConfigStub = sinon.stub(globalConfigHandler, 'getGlobalConfig');
            getGlobalConfigStub.resolves(mockdata.getGlobalConfig());
        });

        afterEach(() => {
            getGlobalConfigStub.restore();
        });

        it('handleGenerateK8sAppConfig should return true for valid ', async () => {


            const deletedinput= {
                projectRootFolder:  mockData.getTestConfig().newProjectConfig.projectRootFolder,


            }

            try {

                const deleteResponse = await k8sHandler.handleDeleteK8sAppConfig(deletedinput);
            }catch (e) {
                console.log(e);
            }



            console.log("deleted");
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



    })
});
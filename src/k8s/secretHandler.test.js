import * as k8sSecretHandler from './secretHandler.js';
import {envToJson, handleGetAllSecrets, isSecretExists} from './secretHandler.js';
import {assert} from 'chai';
import * as mockdata from "../../__tests/mockData.js";
import sinon from "sinon";
import appConfigHandler from "../appConfigHandler.js";
import {getEnvFilePath} from "../../__tests/mockData.js";
import {executeKubectlContents} from "./k8sService.js";
import {handleCreateSecrets} from "./secretHandler.js";

describe('k8sSecretHandler', function () {

    let config = mockdata.getConfig();
    let loadDeployGateConfigStub;
    beforeEach(() => {


        config = mockdata.getConfig();
        loadDeployGateConfigStub = sinon.stub(appConfigHandler, 'loadDeployGateConfig');
        loadDeployGateConfigStub.resolves(config);
    });

    afterEach(() => {
        loadDeployGateConfigStub.restore();
    });

    it('should correctly encode a string to base64', async function () {
        const str = 'Hello, World!';
        const expected = 'SGVsbG8sIFdvcmxkIQ=='; // Base64 encoded string of 'Hello, World!'
        const result =  k8sSecretHandler.base64Encode(str);
        assert.equal(result, expected);
    });

    it('envfile to json should work correctly', async function () {
        const envFile=        getEnvFilePath()
        const result = await envToJson(envFile);
        console.log(result);
            assert.isObject(result);

    });

    it('handleCreateSecrets should  create secrets in k8s for a valid env file', async function () {
        const filePath=        getEnvFilePath()
        const appName = "test"
        const contents = await handleCreateSecrets({filePath,appName});
        console.log(contents);
        assert.isNotNull(contents);



    });
    it('handleCreateSecrets should  throw exception for an invalid f env file', async function () {
        const filePath=     "invalidfile.env"
        const appName = "test"
        try {
            const contents = await handleCreateSecrets({filePath,appName});
            assert.fail('should have thrown an exception')
        }catch (e) {
            console.log(e);
            assert.isNotNull(e);
        }





    });

    it('getAllSecrets should retrieve all Secrets', async function () {

        const appName = "test"
        const contents = await handleGetAllSecrets(appName);

        console.log(contents);
        assert.isNotNull(contents);



    });
    it('isSecretExists for valid group and key should return true', async function () {
        const appName = "test"
            const exists = await isSecretExists(appName,"ANSIBLE_HOST_NAME");
            assert.isTrue(exists);


    });
    it('isSecretExists for valid group and invalid key should return false', async function () {
        const appName = "test"
            const exists = await isSecretExists(appName,"HALOANSIBLE_HOST_NAME");
            assert.isFalse(exists);


    });
    it('isSecretExists for invalid group and invalid key should return false', async function () {
        const appName = "tffsfest"
            const exists = await isSecretExists(appName,"ANSIBLE_HOST_NAME");
            assert.isFalse(exists);


    });





});
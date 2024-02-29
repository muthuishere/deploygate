import * as k8sSecretHandler from './k8sSecretHandler.js';
import {createSecret, isSecretExists} from './k8sSecretHandler.js';
import {assert} from 'chai';
import * as mockdata from "../../__tests/mockData.js";
import sinon from "sinon";
import appConfigHandler from "../appConfigHandler.js";

describe('base64Encode', function () {

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

    it('should correctly encode a string to base64', function () {
        const str = 'Hello, World!';
        const expected = 'SGVsbG8sIFdvcmxkIQ=='; // Base64 encoded string of 'Hello, World!'
        const result = k8sSecretHandler.base64Encode(str);
        assert.equal(result, expected);
    });

    it('createSecrets should return yaml correctly', async function () {
        const secretName = 'existingSecret';
        const result = await isSecretExists(secretName);
        assert.isTrue(result);
    });


});
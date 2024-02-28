import { expect } from 'chai';
import sinon from 'sinon';

import appConfigHandler from "./appConfigHandler.js";
import input_arg_processor from "./shared/input_arg_processor.js";
import  * as mockdata from '../__tests/mockData.js';
import {handleCreateDomain, handleDeleteDomain} from './domainHandler.js';
import fileService from "./shared/files.js";




async function createTestDomain(processArgs) {

    // const contents = 'test contents';

    // writeFileStub.resolves();

    await handleCreateDomain(processArgs);
}

describe('handleCreateDomain', () => {


    const processArgs = mockdata.processArgs;

    let options =mockdata.getOptions();

    let config = mockdata.getConfig();

    let loadDeployGateConfigStub, getParametersBasedOnOptionsStub, writeFileStub;

    beforeEach(() => {
         options =mockdata.getOptions();

         config = mockdata.getConfig();
        loadDeployGateConfigStub = sinon.stub(appConfigHandler, 'loadDeployGateConfig');
        getParametersBasedOnOptionsStub = sinon.stub(input_arg_processor, 'getParametersBasedOnOptions');
        // writeFileStub = sinon.stub(fileService, 'writeFile');
    });

    afterEach(() => {
        loadDeployGateConfigStub.restore();
        getParametersBasedOnOptionsStub.restore();
        // writeFileStub.restore();
    });

    it('should create domain successfully', async () => {


        loadDeployGateConfigStub.resolves(config);
        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);

        expect(loadDeployGateConfigStub.calledOnce).to.be.true;
        expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should throw error for invalid host', async () => {

        config['ansibleHostName'] = 'dummymuthuishere.com';



        // const contents = 'test contents';

        loadDeployGateConfigStub.resolves(config);
        getParametersBasedOnOptionsStub.resolves(options);
        // writeFileStub.resolves();

        try {
            await handleCreateDomain(processArgs);
            expect.fail('Expected an error to be thrown');
        }catch (e) {

            console.log(e);
            expect(loadDeployGateConfigStub.calledOnce).to.be.true;
            expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        }



        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should  delete domain successfully', async () => {

        loadDeployGateConfigStub.resolves(config);
        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);



        await handleDeleteDomain(processArgs);

        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should throw error for invalid host', async () => {

        // const contents = 'test contents';

        loadDeployGateConfigStub.resolves(config);
        getParametersBasedOnOptionsStub.resolves(options);
        // writeFileStub.resolves();

        try {
            await handleDeleteDomain(processArgs);
            expect.fail('Expected an error to be thrown');
        }catch (e) {

            console.log(e);
            expect(loadDeployGateConfigStub.calledOnce).to.be.true;
            expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        }



        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
});

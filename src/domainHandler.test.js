import { expect } from 'chai';
import sinon from 'sinon';

import appConfigHandler from "./appConfigHandler.js";
import input_arg_processor from "./shared/input_arg_processor.js";
import  * as mockdata from '../__tests/mockData.js';
import {handleCreateDomain, handleDeleteDomain} from './domainHandler.js';
import fileService from "./shared/files.js";
import {getConfig} from "../__tests/mockData.js";


const processArgs = mockdata.getProcessArgs();

const options =mockdata.getOptions();

const config = mockdata.getConfig();

async function createTestDomain(processArgs) {

    // const contents = 'test contents';

    // writeFileStub.resolves();

    await handleCreateDomain(processArgs);
}

describe('handleCreateDomain', () => {




    let loadDeployGateConfigStub, getParametersBasedOnOptionsStub, writeFileStub;

    beforeEach(() => {
        loadDeployGateConfigStub = sinon.stub(appConfigHandler, 'loadDeployGateConfig');
        loadDeployGateConfigStub.resolves(mockdata.getConfig());
        getParametersBasedOnOptionsStub = sinon.stub(input_arg_processor, 'getParametersBasedOnOptions');
        // writeFileStub = sinon.stub(fileService, 'writeFile');
    });

    afterEach(() => {
        loadDeployGateConfigStub.restore();
        getParametersBasedOnOptionsStub.restore();
        // writeFileStub.restore();
    });

    it('should create domain successfully', async () => {



        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);

        expect(loadDeployGateConfigStub.calledOnce).to.be.true;
        expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should throw error for invalid host', async () => {

        config['ansibleHostName'] = 'dummymuthuishere.com';



        // const contents = 'test contents';


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
});

describe('handleDeleteDomain', () => {
    let loadDeployGateConfigStub, getParametersBasedOnOptionsStub, writeFileStub;

    beforeEach(() => {
        loadDeployGateConfigStub = sinon.stub(appConfigHandler, 'loadDeployGateConfig');
        loadDeployGateConfigStub.resolves(mockdata.getConfig());
        getParametersBasedOnOptionsStub = sinon.stub(input_arg_processor, 'getParametersBasedOnOptions');
        // writeFileStub = sinon.stub(fileService, 'writeFile');
    });

    afterEach(() => {
        loadDeployGateConfigStub.restore();
        getParametersBasedOnOptionsStub.restore();
        // writeFileStub.restore();
    });
// working only if run seperately
    it('should  delete domain successfully', async () => {


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
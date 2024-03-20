import { expect } from 'chai';
import sinon from 'sinon';

import globalConfigHandler from "../config/globalConfigHandler.js";
import input_arg_processor from "../shared/input_arg_processor.js";
import  * as mockdata from '../../__tests/mockData.js';

import fileService from "../shared/files.js";
import {getGlobalConfig, getNewProjectConfig} from "../../__tests/mockData.js";
import {getDomainStatus} from "./domainStatusHandler.js";
import {handleCreateDomain} from "./domainCreateHandler.js";
import {handleDeleteDomain} from "./domainDeleteHandler.js";


const processArgs = mockdata.getProcessArgs();

const options =mockdata.getDomainOptions();

const config = mockdata.getNewProjectConfig();

async function createTestDomain(processArgs) {

    // const contents = 'test contents';

    // writeFileStub.resolves();

    await handleCreateDomain(processArgs);
}

describe('handleCreateDomain', () => {




    let getGlobalConfigStub, getParametersBasedOnOptionsStub, writeFileStub;

    beforeEach(() => {
        getGlobalConfigStub = sinon.stub(globalConfigHandler, 'getGlobalConfig');
        getGlobalConfigStub.resolves(mockdata.getGlobalConfig());
        getParametersBasedOnOptionsStub = sinon.stub(input_arg_processor, 'getParametersBasedOnOptions');
        // writeFileStub = sinon.stub(fileService, 'writeFile');
    });

    afterEach(() => {
        getGlobalConfigStub.restore();
        getParametersBasedOnOptionsStub.restore();
        // writeFileStub.restore();
    });

    it('should create domain successfully', async () => {



        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);

        expect(getGlobalConfigStub.calledOnce).to.be.true;
        expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should create domain successfully', async () => {



        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);

        expect(getGlobalConfigStub.calledOnce).to.be.true;
        expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
    it('should get status of domain successfully', async () => {


        const  validDomain = process.env.VALID_SUB_DOMAIN;
        console.log(validDomain);


        const result = await    getDomainStatus({domainName: validDomain});
        console.log(result);
        expect(result).not.to.be.null
        expect(result).hasOwnProperty('isAvailable')
        expect(result.isAvailable).to.be.true;


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
            expect(getGlobalConfigStub.calledOnce).to.be.true;
            expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        }



        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
});

describe('handleDeleteDomain', () => {
    let getGlobalConfigStub, getParametersBasedOnOptionsStub, writeFileStub;

    beforeEach(() => {
        getGlobalConfigStub = sinon.stub(globalConfigHandler, 'getGlobalConfig');
        getGlobalConfigStub.resolves(mockdata.getNewProjectConfig());
        getParametersBasedOnOptionsStub = sinon.stub(input_arg_processor, 'getParametersBasedOnOptions');
        // writeFileStub = sinon.stub(fileService, 'writeFile');
    });

    afterEach(() => {
        getGlobalConfigStub.restore();
        getParametersBasedOnOptionsStub.restore();
        // writeFileStub.restore();
    });
// working only if run seperately
    it('should  delete domain successfully', async () => {


        getParametersBasedOnOptionsStub.resolves(options);
        await createTestDomain(processArgs);



             const result = await handleDeleteDomain({domainName: process.env.VALID_SUB_DOMAIN});
              expect(result).not.to.be.null


    });
    it('should throw error for invalid host', async () => {

        // const contents = 'test contents';

        getGlobalConfigStub.resolves(config);
        getParametersBasedOnOptionsStub.resolves(options);
        // writeFileStub.resolves();

        try {
            await handleDeleteDomain({domainName: process.env.VALID_SUB_DOMAIN});
            expect.fail('Expected an error to be thrown');
        }catch (e) {

            console.log(e);
            expect(getGlobalConfigStub.calledOnce).to.be.true;
            expect(getParametersBasedOnOptionsStub.calledOnce).to.be.true;
        }



        // expect(writeFileStub.calledOnceWith('create-redirected-domain.yaml', contents)).to.be.true;
    });
});
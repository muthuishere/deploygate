import {expect} from 'chai';
import * as inputArgProcessor from './input_arg_processor.js';
import  inquirerService from "./inquirerService.js";
import  fileService from "./files.js";
import sinon from "sinon";
import {handleRemoveConfig, saveDeployGateConfig} from "../config/globalConfigHandler.js";

describe('getParametersBasedOnOptions', () => {
    let getInteractiveInputsStub;

    beforeEach(() => {

         getInteractiveInputsStub = sinon.stub(inquirerService, 'getInteractiveInputs');//.returns(Promise.resolve( inputs));

    });

    afterEach(() => {
        // Restore the original function after each test
        getInteractiveInputsStub.restore();
    });

    it('should return valid inputs', async () => {
        const processArgs = ['node', 'script.js', '--option1', 'value1'];
        const cliOptions = {
            option1: {
                demandOption: true,
                type: 'string',
                default: 'defaultOption1',
            },
            option2: {
                demandOption: false,
                type: 'string',
                default: 'defaultoption2',
            },
        };


        getInteractiveInputsStub.resolves({ option1: 'value1', option2: 'value2' });

        const result = await inputArgProcessor.getProcessedCommandLineParameters(processArgs, cliOptions);

        expect(result).to.deep.equal({ option1: 'value1', option2: 'defaultoption2' });
        expect(getInteractiveInputsStub.called).to.be.false; // getInteractiveInputs should not be called
    });

    it('should call getInteractiveInputs if not all options are set', async () => {
        const processArgs = ['node', 'script.js'];
        const cliOptions = {
            option1: {
                demandOption: true,
                type: 'string',
                default: 'defaultoption1'
            },
            option2: {
                demandOption: false,
                type: 'string',
                default: 'defaultoption2'
            },
        };

        // Define the result that getInteractiveInputs should return
        getInteractiveInputsStub.resolves({ option1: 'value1', option2: 'value2' });

        const result = await inputArgProcessor.getProcessedCommandLineParameters(processArgs, cliOptions);

        expect(result).to.deep.equal({ option1: 'value1', option2: 'value2' });
        expect(getInteractiveInputsStub.called).to.be.true; // getInteractiveInputs should be called
    });
});




describe('handleRemoveConfig', () => {
    let confirmActionStub;
    let deleteFileStub;
    let fileExistsStub

    beforeEach(async () => {

        confirmActionStub = sinon.stub(inquirerService, 'confirmAction');
        deleteFileStub = sinon.stub(fileService, 'deleteFile');
        fileExistsStub = sinon.stub(fileService, 'fileExists');

    });

    afterEach(() => {
        confirmActionStub.restore();
        deleteFileStub.restore();
        fileExistsStub.restore();
    });

    it('should delete configuration when user confirms', async () => {
        confirmActionStub.resolves(true);
        fileExistsStub.resolves(true);



        await handleRemoveConfig();

        expect(confirmActionStub.calledOnce).to.be.true;
        expect(deleteFileStub.calledOnce).to.be.true;
    });

    it('should not delete configuration when user does not confirm', async () => {
        confirmActionStub.resolves(false);
        fileExistsStub.resolves(true);

        await handleRemoveConfig();

        expect(confirmActionStub.calledOnce).to.be.true;
        expect(deleteFileStub.called).to.be.false;
    });
});
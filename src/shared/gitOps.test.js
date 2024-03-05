import {expect} from "chai";
import * as gitOps from "./gitOps.js";
import {getTestConfig} from "../../__tests/mockData.js";


describe('gitOps', () => {

    c
    const { cleanGitFolder,dirtyGitFolder,noGitFolder} = getTestConfig().gitFolders;

    const testCases =[
        {folder:cleanGitFolder,expected:true}
        ,{folder:dirtyGitFolder,expected:false}

    ]

    testCases.forEach((input) => {
        it(`for Folder ${input.folder} expected is ${input.expected}  `, async function () {
            const result = await gitOps.isGitStatusClean(input.folder);
            expect(result).to.equal(input.expected);
        });
    });


});

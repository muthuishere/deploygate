import {expect} from "chai";
import * as versionManager from "./version_manager.js";

describe('versionManager', () => {

    const testCases = [
        { input: ['1.2.3', 'major'], expected: '2.0.0' },
        { input: ['1.2.3', 'minor'], expected: '1.3.0' },
        { input: ['1.2.3', 'patch'], expected: '1.2.4' },
        { input: ['latest', 'major'], expected: 'latest' }
    ];

    testCases.forEach(({ input, expected }) => {
        it(`should update version from ${input[0]} with type ${input[1]} to ${expected}`, function() {
            const result = versionManager.incrementVersion(...input);
            expect(result).to.equal(expected);
        });
    });
});

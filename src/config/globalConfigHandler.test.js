import { expect } from 'chai';
import { saveDeployGateConfig, getGlobalConfig, CONFIG_PATH } from './globalConfigHandler.js';
import fs from 'fs';
import {writeFile} from "../shared/files.js";

function getJsonFileFrom(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

describe('globalConfigHandler', () => {
    const mockConfig = { key: 'value' };

    afterEach(() => {
        // Clean up after each test
        if (fs.existsSync(CONFIG_PATH)) {
            fs.unlinkSync(CONFIG_PATH);
        }
    });

    it('saveDeployGateConfig', async () => {
        await saveDeployGateConfig(mockConfig);
        const savedConfig = await getJsonFileFrom(CONFIG_PATH);
        expect(savedConfig).to.deep.equal(mockConfig);
    });

    it('getGlobalConfig', async () => {
        await writeFile(CONFIG_PATH, JSON.stringify(mockConfig, null, 2));
        const loadedConfig = await getGlobalConfig();
        expect(loadedConfig).to.deep.equal(mockConfig);
    });


});
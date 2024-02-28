import { expect } from 'chai';
import { saveDeployGateConfig, loadDeployGateConfig, CONFIG_PATH } from './appConfigHandler.js';
import fs from 'fs';
import {writeFile} from "./shared/files.js";

function getJsonFileFrom(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

describe('appConfigHandler', () => {
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

    it('loadDeployGateConfig', async () => {
        await writeFile(CONFIG_PATH, JSON.stringify(mockConfig, null, 2));
        const loadedConfig = await loadDeployGateConfig();
        expect(loadedConfig).to.deep.equal(mockConfig);
    });


});
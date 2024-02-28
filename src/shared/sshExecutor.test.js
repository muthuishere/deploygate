
import {executeShellScript} from './sshExecutor.js';

describe('SshExecutor Tests', () => {

    it('should execute a command', async () => {
        const result = await executeShellScript("root@muthuishere.com","echo 'Hello World'");
        console.log(result);
        expect(result).to.equal("Hello World\n");
    });

});
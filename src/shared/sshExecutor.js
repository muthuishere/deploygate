import {runProcess} from "./system_processor.js";


export function executeShellScript(userRemoteHost,scriptContents) {
    const contentsToExecute = createSSHCommandFromContents(userRemoteHost,scriptContents);
    return runProcess('bash', ['-c', contentsToExecute]);
}


function createSSHCommandFromContents(userRemoteHost, scriptContents) {
    // Escape backticks and $ in scriptContents for use in a template literal
    const escapedScript = scriptContents.replace(/`|\$/g, '\\$&');

    // Construct the SSH command
    const sshCommand = `ssh ${userRemoteHost} bash <<'EOF'\n${escapedScript}\nEOF`;

    return sshCommand;
}
function createSSHCommandFromFile(userRemoteHost, file) {

    const scriptContents = fs.readFileSync(file, 'utf8');

    return createSSHCommandFromContents(userRemoteHost, scriptContents);
}
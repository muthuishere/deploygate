import {runProcess} from "../shared/system_processor.js";

export function executeDockerCommandWith(args) {

    console.log('args', args)
    return runProcess('docker', [ ...args]);
}


import {runProcess} from "../shared/system_processor.js";

export function executeDockerCommandWith(args) {

    return runProcess('docker', [ ...args]);
}


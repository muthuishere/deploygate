/**
 * @param {string} currentVersion - The current version in the format 'x.y.z'
 * @param {('major'|'minor'|'patch'|'none')} incrementType - The type of the next version
 * @returns {string} - The updated version
 */
export function incrementVersion(currentVersion, incrementType) {
    let [major, minor, patch] = currentVersion.split('.').map(Number);


    if(currentVersion === "latest" || incrementType === 'none'){
        return currentVersion
    }
    switch (incrementType) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
            patch++;
            break;
        default:
            return currentVersion;
    }

    return `${major}.${minor}.${patch}`;
}
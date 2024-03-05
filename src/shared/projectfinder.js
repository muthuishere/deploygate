
import fs from 'fs';
import path from "path";

export function getBuildCommand(folderPath) {
    const files = fs.readdirSync(folderPath);

    if (files.includes('package.json')) {
        return 'npm run build';
    } else if (files.includes('pom.xml')) {
        return './mvnw package';
    } else if (files.includes('build.gradle')) {
        return './gradlew build';
    } else {
        return '';
    }
}

// Usage
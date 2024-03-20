import path from "path";
import fileService from "../shared/files.js";


export function getDomainTemplateNamed(filePath) {
    return path.join(fileService.getProjectRootFolder(), 'assets', 'domainmanager', filePath);
}
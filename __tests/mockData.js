
export const processArgs = [
    '',
    '/deploygate/bin/init_config.js'
]


export const  domainName =  process.env.DOMAIN_NAME || "something.com" ;
export const testDomainName = "test." + domainName;
export const testRedirectPort =9898;


 const options = {
    domainName: testDomainName,
    redirectPort: testRedirectPort,
    enableSSL: true
};
 const config = {
    "remoteServerAlias": process.env.REMOTE_SERVER_ALIAS || "test@something.com",
    "ansibleHostName": process.env.ANSIBLE_HOST_NAME ||"something.com",
    "customRegistryUrl": process.env.CUSTOM_REGISTRY_URL ||"registry.something.com",
    "customRegistryCredentialsName": process.env.CUSTOM_REGISTRY_CREDENTIALS_NAME ||"temp-credentials"
};


export function getOptions(){
    return {...options};
}

export function getConfig(){
    return {...config};

}

export function getProcessArgs(){
    return processArgs;
}
export function getDomainName(){
    return domainName;
}
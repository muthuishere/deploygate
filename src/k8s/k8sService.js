import * as k8s from "@kubernetes/client-node";

export class K8sService{

    constructor(filename){
        if(!!filename)
            this.filename = filename;
        else
            throw new Error('Kubernetes Configuration filename is required');

    }

    async init() {
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(this.filename);
        this.k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
        console.log('k8sCoreApi', this.k8sCoreApi);
        this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
        console.log('k8sAppsApi', this.k8sAppsApi);
    }

    async getK8sCoreApi() {
        return this.k8sCoreApi;
    }

    async getK8sAppsApi() {
        return this.k8sAppsApi;
    }
}

// export async function getK8sCoreApi() {
//
//     return k8sCoreApi;
//
// }
//
// export async function getK8sAppsApi() {
//
//
//     return k8sAppsApi;
//
// }
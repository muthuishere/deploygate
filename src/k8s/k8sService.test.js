import {expect} from "chai";
import * as k8sService from "./k8sService.js";
describe('k8sService', () => {

    it('should update current context', async () => {
        // add block here
        const currentContext = await k8sService.getCurrentContext();
        console.log(currentContext);
        expect(currentContext).to.be.a('string');

    });
});

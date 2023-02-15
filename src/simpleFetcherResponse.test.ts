import {createSimpleFetcherResponse, SimpleFetcherResponse} from "./simpleFetcherResponse";
import {StubHeaderData} from "./stub-header-data";
import {createStubResponseData} from "./stub-response-data";
import {createExactMatcher} from "./build-request-matcher";
import {FetcherStubError} from "./fetcher-stub";

describe('SimpleFetcherResponse', () => {

    it('should respond property with text', async function () {
        const bodyText = '{"key": { "nested": "value", "valid": true}}';
        const response = createSimpleFetcherResponse("http://localhost", createStubResponseData(
            createExactMatcher('http://localhost'), 200, 'Ok', new StubHeaderData(), undefined,
            bodyText
        ));

        // test ctor for good measure.
        expect(new SimpleFetcherResponse()).not.toBeNull();
        expect(new FetcherStubError('error', 'http://localhost',[])).not.toBeNull();
        expect(await response.text()).toBe(bodyText);
    });

    it('should respond property with json', async function () {
        const bodyText = '{"key": { "nested": "value", "valid": true}}';
        const response = createSimpleFetcherResponse("http://localhost", createStubResponseData(
            createExactMatcher('http://localhost'), 200, 'Ok', new StubHeaderData(), undefined,
            bodyText
        ));

        expect(await response.json()).toEqual({key: {nested: 'value', valid: true}});
    });

    it('should implement clone properly', async function () {

        const bodyText = '{"key": { "nested": "value", "valid": true}}';
        const response = createSimpleFetcherResponse("http://localhost", createStubResponseData(
            createExactMatcher('http://localhost'), 200, 'Ok', new StubHeaderData(), undefined,
            bodyText
        ));

        const buffer = await response.arrayBuffer();
        const s = buffer.toString();

        expect(s).toBe('123,34,107,101,121,34,58,32,123,32,34,110,101,115,116,101,100,34,58,32,34,118,97,108,117,101,34,44,32,34,118,97,108,105,100,34,58,32,116,114,117,101,125,125');
    });

    it('should implement clone properly', async function () {

        const bodyText = '{"key": { "nested": "value", "valid": true}}';
        const response = createSimpleFetcherResponse("http://localhost", createStubResponseData(
            createExactMatcher('http://localhost'), 200, 'Ok', new StubHeaderData(), undefined,
            bodyText
        ));

        const clonedResponse = response.clone();

        expect(await response.text()).toBe(await clonedResponse.text());
    });
})

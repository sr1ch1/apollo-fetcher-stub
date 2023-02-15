import buildRequestMatcher, {createExactMatcher, createRegexMatcher, MatcherType} from "./build-request-matcher";
import {HttpMethod} from "./http-method";
import {StubHeaderData} from "./stub-header-data";
import {expect} from "@jest/globals";

describe('buildRequestMatcher', () => {

    it('should build a string request matcher', function () {
        const headers = new StubHeaderData();
        const matcher = buildRequestMatcher(HttpMethod.GET, createExactMatcher("http://localhost"), headers, '');

        expect(matcher.type).toBe(MatcherType.MATCH_STRING);
        expect(matcher.payload as string).toBe('GET http://localhost HTTP/1.1\r\n');
    });

    it('should build a string request matcher with headers', function () {
        const headers = new StubHeaderData();
        headers.set('Authorization', 'Basic abcdef123123123');
        const matcher = buildRequestMatcher(HttpMethod.GET, createExactMatcher("http://localhost"), headers, '');

        expect(matcher.type).toBe(MatcherType.MATCH_STRING);
        expect(matcher.payload as string).toBe('GET http://localhost HTTP/1.1\r\n' +
            'authorization: Basic abcdef123123123\r\n');
    });

    it('should build a regex request matcher', function () {
        const headers = new StubHeaderData();
        const matcher = buildRequestMatcher(HttpMethod.GET, createRegexMatcher(/http:\/\/localhost:[0-9]{1-5}/), headers, '');

        expect(matcher.type).toBe(MatcherType.MATCH_REGEX);
        expect(matcher.payload.toString()).toMatch('/GET\\ http:\\/\\/localhost:[0-9]{1-5}\\ HTTP\\/1\\.1\\r\\n/');
    });
})
import {StubHeaderData} from "./stub-header-data";
import {createExactMatcher, RequestMatcher} from "./build-request-matcher";
import {FetcherRequestInit /*, FetcherResponse*/} from "@apollo/utils.fetcher";

export class StubResponseData {
   bodyUsed = false;
   headers: StubHeaderData = new StubHeaderData();
   ok = true;
   redirected = false;
   status = 200;
   statusText = 'Ok';
   urlMatcher: RequestMatcher = createExactMatcher('');
   body = '';
   init: FetcherRequestInit | undefined;
}

export function createStubResponseData(urlMatcher: RequestMatcher, statusCode: number, statusText: string, headers: StubHeaderData,
    init?: FetcherRequestInit, body?: string) : StubResponseData {
    return {
        bodyUsed: !!body,
        headers,
        ok: statusCode>=200 && statusCode<=299,
        redirected: statusCode>=300 && statusCode<=399,
        statusText,
        urlMatcher: urlMatcher,
        status: statusCode,
        body: body || '',
        init
    }
}

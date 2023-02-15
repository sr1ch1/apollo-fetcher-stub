import {StubResponseData} from "./stub-response-data";
import {FetcherResponse} from "@apollo/utils.fetcher";

export class SimpleFetcherResponse extends StubResponseData implements FetcherResponse {
    url = '';

    arrayBuffer(): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        return Promise.resolve(encoder.encode(this.body));
    }

    clone = (): FetcherResponse => createSimpleFetcherResponse(this.url, this);

    json = <T>(): Promise<T> => Promise.resolve(JSON.parse(this.body));

    text = (): Promise<string> => Promise.resolve(this.body);
}

export function createSimpleFetcherResponse(url: string, data: StubResponseData): SimpleFetcherResponse {
    const response = new SimpleFetcherResponse();
    response.bodyUsed = data.bodyUsed;
    response.headers = data.headers;
    response.ok = data.ok;
    response.redirected = data.redirected;
    response.status = data.status
    response.statusText = data.statusText;
    response.urlMatcher = data.urlMatcher;
    response.body = data.body;
    response.init = data.init;
    response.url = url;
    return response;
}

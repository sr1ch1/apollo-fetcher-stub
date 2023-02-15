import {HttpMethod} from "./http-method";
import {RequestResolver} from "./request-resolver";
import {StubHeaderData} from "./stub-header-data";
import {FetcherStubResponse, IFetcherStubResponse} from "./fetcher-stub-response";
import {createExactMatcher, createRegexMatcher} from "./build-request-matcher";

export interface IFetcherStubRequest {
  withHeader(key: string, value: string): IFetcherStubRequest;

  withBody(body: string, contentType?: string): IFetcherStubRequest;

  responds() : IFetcherStubResponse;
}

export class FetcherStubRequest implements IFetcherStubRequest {
  private readonly _headers: StubHeaderData = new StubHeaderData();
  private _body = '';

  constructor(private _method: HttpMethod, private _url: string | RegExp, private _resolver: RequestResolver) {}

  withHeader(key: string, value: string): IFetcherStubRequest {
    this._headers.set(key, value);
    return this;
  }

  withBody(body: string, contentType?: string): IFetcherStubRequest {
    this._body = body;
    if (contentType) {
      this._headers.set('Content-Type', contentType);
    }
    return this;
  }

  responds() : IFetcherStubResponse {
    const urlMatcher = this._url instanceof RegExp? createRegexMatcher(this._url) : createExactMatcher(this._url);
    return new FetcherStubResponse(this._method, urlMatcher, this._headers, this._body, this._resolver);
  }
}

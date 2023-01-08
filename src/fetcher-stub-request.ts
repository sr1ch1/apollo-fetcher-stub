import {HttpMethod} from "./http-method";
import {ResolverDictionary} from "./resolver-dictionary";
import {StubHeaderData} from "./stub-header-data";
import {FetcherStubResponse, IFetcherStubResponse} from "./fetcher-stub-response";

export interface IFetcherStubRequest {
  withHeader(key: string, value: string): IFetcherStubRequest;

  withBody(body: string, contentType?: string): IFetcherStubRequest;

  responds() : IFetcherStubResponse;
}

export class FetcherStubRequest implements IFetcherStubRequest {
  private readonly _headers: StubHeaderData = new StubHeaderData();
  private _body = '';

  constructor(private _method: HttpMethod, private _url: string, private _resolveDictionary: ResolverDictionary) {}

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
    return new FetcherStubResponse(this._method, this._url, this._headers, this._body, this._resolveDictionary);
  }
}

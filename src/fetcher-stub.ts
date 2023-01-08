import {HttpMethod} from "./http-method";
import {FetcherStubRequest, IFetcherStubRequest} from "./fetcher-stub-request";
import {ResolverDictionary} from "./resolver-dictionary";
import type {FetcherRequestInit} from "@apollo/utils.fetcher";
import {StubHeaderData} from "./stub-header-data";
import buildRequestString from "./build-request-string";
import {FetcherResponse} from "@apollo/utils.fetcher";

export class FetcherStub {
  // this maps an HTTP request to an expected HTTP response
  readonly _resolverDictionary: ResolverDictionary = new ResolverDictionary();

  get(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.GET, url, this._resolverDictionary)
  }

  head(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.HEAD, url, this._resolverDictionary)
  }

  post(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.POST, url, this._resolverDictionary)
  }

  put(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.PUT, url, this._resolverDictionary)
  }

  patch(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.PATCH, url, this._resolverDictionary)
  }

  delete(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.DELETE, url, this._resolverDictionary)
  }

  options(url: string): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.OPTIONS, url, this._resolverDictionary)
  }

  public get fetcher() {
    return {
      fetch: (url: string, _init?: FetcherRequestInit): Promise<FetcherResponse> => {
        const request = this.buildRequest(url, _init);
        const response = this._resolverDictionary.get(request);
        if (response) {
          return Promise.resolve(response)
        }
          throw new Error('Stub not prepared properly');
      }
    }
  }

  private buildRequest(url: string, _init?: FetcherRequestInit): string {
    const headers = new StubHeaderData();
    if (_init?.headers) {
      for (const key in _init.headers) {
        headers.set(key, _init.headers[key]);
      }
    }
    return buildRequestString(_init?.method || HttpMethod.GET, url, headers, _init?.body?.toString() || '');
  }
}

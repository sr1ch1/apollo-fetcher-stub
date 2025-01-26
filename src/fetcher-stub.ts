import {HttpMethod} from "./http-method";
import {FetcherStubRequest, IFetcherStubRequest} from "./fetcher-stub-request";
import {RequestResolver} from "./request-resolver";
import type {FetcherRequestInit} from '@apollo/utils.fetcher';
import {FetcherResponse} from "@apollo/utils.fetcher";
import {StubHeaderData} from "./stub-header-data";
import buildRequestMatcher, {createExactMatcher} from "./build-request-matcher";

export class FetcherStubError extends Error {
  constructor(msg: string, public request: string, public requestMatcher: string[]) {
    super(msg);
    Object.setPrototypeOf(this, FetcherStubError.prototype);
  }
}

export class FetcherStub {
  // this maps an HTTP request to an expected HTTP response
  readonly _resolver: RequestResolver = new RequestResolver();

  get(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.GET, url, this._resolver)
  }

  head(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.HEAD, url, this._resolver)
  }

  post(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.POST, url, this._resolver)
  }

  put(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.PUT, url, this._resolver)
  }

  patch(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.PATCH, url, this._resolver)
  }

  delete(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.DELETE, url, this._resolver)
  }

  options(url: string | RegExp): IFetcherStubRequest {
    return new FetcherStubRequest(HttpMethod.OPTIONS, url, this._resolver)
  }

  public get fetcher() {
    return {
      fetch: (url: string, _init?: FetcherRequestInit): Promise<FetcherResponse> => {
        const request = this.buildRequest(url, _init);
        const response = this._resolver.resolve(url, request);
        if (response) {
          return Promise.resolve(response)
        }
        throw new FetcherStubError('Stub not prepared properly', request, this._resolver.getMatchingRequests());
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
    const requestMatcher = buildRequestMatcher(_init?.method || HttpMethod.GET,
        createExactMatcher(url), headers, _init?.body?.toString() || '');
    return requestMatcher.payload as string;
  }
}

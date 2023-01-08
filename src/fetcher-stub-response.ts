import {StubHeaderData} from "./stub-header-data";
import type {FetcherRequestInit} from "@apollo/utils.fetcher";
import {HttpMethod} from "./http-method";
import {ResolverDictionary} from "./resolver-dictionary";
import buildRequestString from "./build-request-string";
import {StubResponseData} from "./stub-response-data";

export interface IFetcherStubResponse {
  withStatusCode(statusCode: number): IFetcherStubResponse;

  withStatusText(statusText: string): IFetcherStubResponse;

  withStatus(statusCode: number, statusText: string): IFetcherStubResponse;

  withHeader(key: string, value: string): IFetcherStubResponse;

  withBody(body: string, contentType?: string): IFetcherStubResponse;
}

export class FetcherStubResponse implements IFetcherStubResponse {
  private readonly _init: FetcherRequestInit;
  private readonly _request : string;
  private _statusCode = 200;
  private _statusText = 'Ok';
  private _responseBody = '';
  private readonly _responseHeaders: StubHeaderData = new StubHeaderData();

  constructor(private _method: HttpMethod, private _url: string, private _requestHeaders: StubHeaderData,
              private _requestBody: string, private _resolveDictionary: ResolverDictionary) {
    const requestHeader: Record<string, string> = {};
    for (const [key, value] of this._requestHeaders) {
      requestHeader[key] = value;
    }

    this._init = {
      method: this._method,
      headers: requestHeader,
      body: this._responseBody
    }
    this._request = buildRequestString(this._method, this._url, this._requestHeaders, this._requestBody);
  }

  private buildResponse() {
    const responseHeaders = this._responseHeaders;
    this._resolveDictionary.set(this._request, new StubResponseData(this._url, this._statusCode, this._statusText,
      responseHeaders, this._init, this._responseBody));
  }

  withStatusCode(statusCode: number): IFetcherStubResponse {
    this._statusCode = statusCode;
    this.buildResponse();
    return this;
  }

  withStatusText(statusText: string): IFetcherStubResponse {
    this._statusText = statusText;
    this.buildResponse();
    return this;
  }

  withStatus(statusCode: number, statusText: string): IFetcherStubResponse {
    this._statusCode = statusCode;
    this._statusText = statusText;
    this.buildResponse();
    return this;
  }

  withHeader(key: string, value: string): IFetcherStubResponse {
    this._responseHeaders.set(key, value);
    this.buildResponse();
    return this;
  }

  withBody(body: string, contentType?: string): IFetcherStubResponse {
    this._responseBody = body;
    if (contentType) {
      this._responseHeaders.set('Content-Type', contentType);
      this._responseHeaders.set('Content-Length', '' + body.length);
    }
    this.buildResponse();
    return this;
  }
}

import type {FetcherRequestInit, FetcherResponse} from "@apollo/utils.fetcher";
import {StubHeaderData} from "./stub-header-data";

export class StubResponseData implements FetcherResponse {
  readonly bodyUsed: boolean;
  readonly headers: StubHeaderData;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: string;
  readonly init: FetcherRequestInit | undefined;

  constructor(url: string, statusCode: number, statusText: string, headers: StubHeaderData, init?: FetcherRequestInit, body?: string) {
    this.bodyUsed = !!body;
    this.headers = headers;
    this.ok = statusCode>=200 && statusCode<=299;
    this.redirected = statusCode>=300 && statusCode<=399;
    this.statusText = statusText;
    this.url = url;
    this.status = statusCode;
    this.body = body || '';
    this.init = init;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(this.body));
  }

  clone = (): FetcherResponse => new StubResponseData(this.url, this.status, this.statusText, this.headers, this.init, this.body);

  json = <T>(): Promise<T> => Promise.resolve(JSON.parse(this.body));

  text = (): Promise<string> => Promise.resolve(this.body);
}

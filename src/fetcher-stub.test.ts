import {FetcherStub, FetcherStubError} from "./fetcher-stub";
import {expect} from "@jest/globals";

describe('FetcherStub', () => {

  it('should respond to get request', async () => {
    const stub = new FetcherStub()
    stub.get("http://localhost:8080/test").responds().withStatusCode(204);

    const response = await stub.fetcher.fetch('http://localhost:8080/test');

    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(204);
  })

  it('should respond to get with a redirect', async () => {
    const stub = new FetcherStub()
    stub.get("http://localhost:8080/test").responds().withStatusCode(301);

    const response = await stub.fetcher.fetch('http://localhost:8080/test');

    expect(response.ok).toBeFalsy();
    expect(response.redirected).toBeTruthy();
    expect(response.status).toBe(301);
  })

  it('should throw error on unknown get request', async () => {
    const stub = new FetcherStub()
    stub.get("http://localhost:8080/test").responds().withStatusCode(204);

    try {
      await stub.fetcher.fetch('http://localhost:8080/unknown')
    } catch (e) {
      expect(e).toEqual(new Error('Stub not prepared properly'));
    }
  })

  it('should respond to head request', async () => {
    const stub = new FetcherStub()
    stub.head("http://localhost:8080/test").responds().withStatusCode(204);

    const response = await stub.fetcher.fetch('http://localhost:8080/test', { method: 'HEAD' });

    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(204);
  })

  it('should only respond to head request', async () => {
    const stub = new FetcherStub()
    stub.head("http://localhost:8080/test").responds().withStatusCode(204);

    try {
      await stub.fetcher.fetch('http://localhost:8080/test', { method: 'GET' });
    } catch (e) {
      expect(e).toEqual(new Error('Stub not prepared properly'));
    }
  })

  it('should respond to head and get request with same URL', async () => {
    const stub = new FetcherStub()
    stub.head("http://localhost:8080/test").responds().withStatusCode(204);
    stub.get("http://localhost:8080/test").responds().withStatusCode(204);

    const headResponse = await stub.fetcher.fetch('http://localhost:8080/test', { method: 'HEAD' });
    expect(headResponse.ok).toBeTruthy();
    expect(headResponse.status).toBe(204);

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/test', { method: 'GET' });
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(204);
  })

  it('should respond to post request with body', async () => {
    const stub = new FetcherStub()
    stub.post("http://localhost:8080/user").withBody('{name:"Max"}', 'application/json').responds().withStatusCode(201);

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/user', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{name:"Max"}'
    });
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(201);
  })

  it('should respond to post request with body and capital header', async () => {
    const stub = new FetcherStub()
    stub.post("http://localhost:8080/user").withBody('{name:"Max"}', 'application/json').responds().withStatusCode(201);

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/user', {
      method: 'POST',
      headers: {'CONTENT-TYPE': 'application/json'},
      body: '{name:"Max"}'
    });
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(201);
  })

  it('should respond to put request with body', async () => {
    const stub = new FetcherStub()
    stub.put("http://localhost:8080/user").withBody('{name:"Max"}', 'application/json').responds().withStatusCode(201);

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/user', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: '{name:"Max"}'
    });
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(201);
  })

  it('should respond to delete request', async () => {
    const stub = new FetcherStub()
    stub.delete("http://localhost:8080/user/2211").responds().withStatus(200, 'entry deleted');

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/user/2211', {method: 'DELETE'});
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(200);
    expect(getResponse.statusText).toBe('entry deleted');
  })

  it('should respond with body to path request', async () => {
    const stub = new FetcherStub()
    stub.patch("http://localhost:8080/user").withBody('{"name":"Max"}', 'application/json').responds()
      .withBody('{"name":"Max", "age":33}', 'application/json')
      .withStatusCode(200);

    const getResponse = await stub.fetcher.fetch('http://localhost:8080/user', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: '{"name":"Max"}'
    });
    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(200);
    expect(getResponse.bodyUsed).toBeTruthy();
    const obj = await getResponse.json();
    expect(obj).toEqual({ name: 'Max', age: 33});

    const arrayBuffer = await getResponse.arrayBuffer();
    const enc = new TextDecoder("utf-8");
    const body = enc.decode(arrayBuffer);
    expect(body).toBe('{"name":"Max", "age":33}');
  })

  it('should respond with proper headers to a OPTIONS request', async () => {
    const stub = new FetcherStub()
    stub.options("/")
      .withHeader('Host', 'service.example.com')
      .withHeader('Origin', 'https://www.example.com')
      .withHeader('Access-Control-Request-Method', 'PUT')
      .responds()
      .withHeader('Access-Control-Allow-Origin', 'https://www.example.com')
      .withHeader('Access-Control-Allow-Methods', 'PUT')
      .withStatusCode(200)
      .withStatusText('Ok');

    const getResponse = await stub.fetcher.fetch('/', {
      method: 'OPTIONS',
      headers: {
        'Host': 'service.example.com',
        'Origin': 'https://www.example.com',
        'Access-Control-Request-Method': 'PUT'
      }
    });

    expect(getResponse.ok).toBeTruthy();
    expect(getResponse.status).toBe(200);
    expect(getResponse.statusText).toBe('Ok');
    expect(getResponse.bodyUsed).toBeFalsy();
    expect(getResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://www.example.com');
    expect(getResponse.headers.get('Access-Control-Allow-Methods')).toBe('PUT');
  })

  it('should respond to a fuzzy get request', async () => {
    const stub = new FetcherStub()
    stub.get('http://localhost:2000/nothing').withHeader('Host', 'service.example.com').responds().withStatusCode(204);
    stub.get(/http:\/\/localhost:8080\/test/).responds().withStatusCode(204);

    const response = await stub.fetcher.fetch('http://localhost:8080/test');
    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(204);

    // other Jest syntax seems to be flaky/unstable in different versions.
    try {
      await stub.fetcher.fetch('http://localhost:2000/test')
    } catch(e) {
      const err = e as FetcherStubError;
      expect(err.message).toBe('Stub not prepared properly');
    }
  })

  it('should throw an error when fuzzy get request was not found', async () => {
    const stub = new FetcherStub()
    stub.get(/http:\/\/localhost:8080\/error/).responds().withStatusCode(204);

    // other Jest syntax seems to be flaky/unstable in different versions.
    try {
      await stub.fetcher.fetch('http://localhost:8090/test')
    } catch(err) {
      expect((err as Error).message).toBe('Stub not prepared properly')
    }
  })


  it('should respond to a fuzzy get request with different URLs', async () => {
    const stub = new FetcherStub();
    stub.get(/http:\/\/localhost:[0-9]{0,5}\/test/).responds().withStatusCode(204);

    const response = await stub.fetcher.fetch('http://localhost:4000/test');
    expect(response.ok).toBeTruthy();
    expect(response.status).toBe(204);

    const response2 = await stub.fetcher.fetch('http://localhost:80/test');
    expect(response2.ok).toBeTruthy();
    expect(response2.status).toBe(204);

    // other Jest syntax seems to be flaky/unstable in different versions.
    try {
      await stub.fetcher.fetch('http://localhost:809012/test')
    } catch(e) {
      const err = e as FetcherStubError;
      expect(err.message).toBe('Stub not prepared properly');
    }
  })
})

import {StubHeaderData} from "./stub-header-data";

const buildRequestString = (method: string, url: string, requestHeaders: StubHeaderData, body: string): string => {
  let request = `${method} ${url} HTTP/1.1\r\n`;
  for (const [key, value] of requestHeaders) {
    request += `${key}}: ${value}\r\n`
  }

  if (body) {
    request += '\r\n'
    request += body;
  }

  return request;
}

export default buildRequestString;

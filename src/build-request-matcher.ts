import {StubHeaderData} from "./stub-header-data";

export enum MatcherType {
  MATCH_STRING = "MATCH_STRING",
  MATCH_REGEX = "MATCH_REGEX"
}

type UMT<T, P> = { type: T, payload: P };

const createMatcher = <T extends MatcherType, P>(
    type: T,
    payload: P
) : UMT<T, P> => ({ type, payload });

export const createExactMatcher = (url: string) => createMatcher(MatcherType.MATCH_STRING, url);
export const createRegexMatcher = (urlRegExp: RegExp) => createMatcher(MatcherType.MATCH_REGEX, urlRegExp);

const matcher = {createExactMatcher, createRegexMatcher};

export type RequestMatcher = ReturnType<typeof matcher[keyof typeof matcher]>;

function escapeRegex(regex: string): string {
  return regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const buildRequestMatcher = (method: string, urlMatcher: RequestMatcher, requestHeaders: StubHeaderData, body: string): RequestMatcher => {
  const prefix = `${method} `;
  let suffix = ` HTTP/1.1\r\n`;
  for (const [key, value] of requestHeaders) {
    suffix += `${key.toLowerCase()}: ${value}\r\n`
  }

  if (body) {
    suffix += '\r\n'
    suffix += body;
  }

  switch (urlMatcher.type) {
    case MatcherType.MATCH_STRING: {
      return createExactMatcher(prefix + urlMatcher.payload + suffix);
    }
    case MatcherType.MATCH_REGEX: {
      const regex = urlMatcher.payload.toString();
      const expression = regex.substring(1, regex.length-1);
      const combinedRegex = escapeRegex(prefix) + expression + escapeRegex(suffix);
      return createRegexMatcher(new RegExp(combinedRegex));
    }
  }
}

export default buildRequestMatcher;

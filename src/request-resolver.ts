import {StubResponseData} from "./stub-response-data";
import {RequestMatcher, MatcherType} from "./build-request-matcher";
import {FetcherResponse} from "@apollo/utils.fetcher";
import {createSimpleFetcherResponse} from "./simpleFetcherResponse";

class ResolverDictionary extends Map<string, StubResponseData> {
}

type FuzzyUrlRecord = [RegExp, StubResponseData];

export class RequestResolver {
    private _exactUrls: ResolverDictionary = new ResolverDictionary();
    private _fuzzyUrls: FuzzyUrlRecord[] = [];

    public addUrl(urlMatcher: RequestMatcher, responseData: StubResponseData) {
        switch (urlMatcher.type) {
            case MatcherType.MATCH_STRING: {
                this._exactUrls.set(urlMatcher.payload, responseData);
                return;
            }
            case MatcherType.MATCH_REGEX: {
                this._fuzzyUrls.push([urlMatcher.payload, responseData]);
                return;
            }
        }
    }

    public resolve(url: string, request: string): FetcherResponse | null {

        // try to get an exact match
        const data = this._exactUrls.get(request);
        if (data) {
            return this.createResponse(url, data);
        }

        // use fuzzy urls to find a match
        for (const key in this._fuzzyUrls) {
            const record = this._fuzzyUrls[key];
            const result = request.match(RegExp(record[0]));
            if (result) {
                return this.createResponse(url, record[1]);
            }
        }

        return null;
    }

    private createResponse(url: string, data: StubResponseData): FetcherResponse {
        return createSimpleFetcherResponse(url, data);
    }

    public getMatchingRequests(): string[] {
        const keys = [...this._exactUrls.keys()];
        const message: string[] = [];

        if (keys.length > 0) {

            for (const request of keys) {
                message.push(request);
            }
        }

        if (this._fuzzyUrls.length > 0) {
            for (const key in this._fuzzyUrls) {
                const record = this._fuzzyUrls[key];
                message.push(record[0].toString());
            }
        }

        return message;
    }
}

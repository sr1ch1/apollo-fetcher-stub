[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/sr1ch1/apollo-fetcher-stub/test.yml)](https://github.com/sr1ch1/apollo-fetcher-stub/actions?query=branch%3Amain)
[![Coverage Status](https://coveralls.io/repos/github/sr1ch1/apollo-fetcher-stub/badge.svg?branch=main)](https://coveralls.io/github/sr1ch1/apollo-fetcher-stub?branch=main)
[![npm](https://img.shields.io/npm/v/@sr1ch1/apollo-fetcher-stub)](https://www.npmjs.com/package/@sr1ch1/apollo-fetcher-stub)
[![GitHub](https://img.shields.io/github/license/sr1ch1/apollo-fetcher-stub)](https://opensource.org/licenses/MIT)
# apollo-fetcher-stub
A stub version of the Apollo Server's fetcher interface to simplify integration testing of resolvers that are
based on Apollo Server's RESTDataSource.

## Introduction
This package provides a stub implementation of the fetcher interface that is useful when creating integration tests for resolvers in the Apollo Server 4.
Requests along with corresponding responses can be specified through the fluent interface of this library.

### Overview
Apollo Server 4 uses a multi-step request pipeline to execute incoming GraphQL requests. It allows using plugins for each step.
The plugins may affect the outcome of a GraphQL operation. This makes it important to test the server with plugins enabled.

To enforce separation of concerns and simplify writing integration tests the use of following pattern is recommended
when fetching data from REST-based services:

![apollo-fetcher-stub.svg](docs%2Fapollo-fetcher-stub.svg)


A recommended pattern for implementing resolvers is to use data sources to retrieve/modify data. As it is a common 
use case to fetch data from REST-based services Apollo Server comes with a RESTDataSource class that can be used as a base class
for specific data source implementation. The RESTDataSource makes use of a specific fetcher interface in order to perform HTTP requests.
The fetcher interface can be used to plug in different fetch libraries (node-fetch, make-fetch-happen, or undici).

This library uses the same interface to inject a stub fetcher that can be instrumented for integration testing.

## Installation
### Requirements
- [Apollo Server 4](https://github.com/apollographql/apollo-server)

To install the package use:

`npm install --save-dev sr1ch1/apollo-fetcher-stub`

or with yarn:

`yarn add -D sr1ch1/apollo-fetcher-stub`

## Usage
As this library is intended to be used as a fetcher replacement the documentation will 
focus on the described pattern above.It is not are requirement to rely on the 
RESTDataSource class. The fetcher stub can be used in any context where Apollo's fetcher 
interface is used.

### Premise 
To give a better context in the use of the fetcher stub, it is assumed that you have 
implemented a data source based on the RESTDataSource
```typescript
// this is the implementation of a specific data source based on Apollo Server's RESTDataSource
export class ExampleAPI extends RestDataSource {
  // ... implementation of getData as an example of a function to be made available
  // if this contains non trivial transformations, you may also want to test this.
}
```
Furthermore, you have a resolver that uses this data source
```typescript
export const exampleResolver = {
  Query: {
    populations: async (_, __, {dataSources}) : Promise<void>  => {
      // fetch data via data source. Here we are using the exampleAPI that
      // is injected as a data source.
      const result = await dataSources.exampleAPI.getData()
      // ... the logic you want to test along with the pipeline logic you might have in place.
    }
  },
};
```
### Setting up an integration Test
To create an integration test we need the following steps:
1. Create and set up the fetcher stub. It has to respond to the expected requests with 
appropriate data. This step is specific for each integration test. In this example the
fetcher stub will return the status code 204 whenever it receives a get request with the URL 
`http://localhost:8080/ping`
```typescript
// import the stub
import {FetcherStub} from "@sr1ch1/apollo-fetcher-stub";

// first create a new stub instance
const fetcherStub = new FetcherStub()

// when the fetcher receives a specific get request
fetcherStub.get("http://localhost:8080/ping")
// it responds with this status code
.responds().withStatusCode(204);
```
2. Create an Apollo context function that makes use of the fetcher stub.
```typescript
const createContext = async (): Promise<ContextValue> => {
  return {
    dataSources: {
      // here we create the data source and injecting it with the fetcher stub
      example: new ExampleAPI({ fetcher: fetcherStub }),
    }
  };
}
```
3. Create an Apollo test server that is using the a configuration close to your production server.
```typescript
// For the integration tests, create a test server that is using
// the prepared context for the text
const testServer = new ApolloServer<ContextValue>({
  typeDefs, // the real schema 
  resolvers,// the real resolvers
  plugins   // the real plugins
});
```
4. Run the desired GraphQL query on the test server using the prepared context
```typescript
// create the context with the stub fetcher and real rest data sources.
const contextValue = await createContext(); 

// execute the test GraphQL query using the test server with the real configuration
// the only thing that is stubed is the fetcher the RESTDataSource is using.
// This ensures we test as much of the Apollo Stack as possible.
const response = await testServer.executeOperation({ query }, { contextValue });
```
5. the response is a GraphQLResponse object and can be tested by querying the
available properties.
```typescript
// in this example it is assumed we receive a single data set and
// directly test the properties (example with Jest)
expect(response?.body?.kind).toBe('single');
expect(response.body['singleResult']).toBeDefined();
expect(response.body['singleResult']['data']).toBeDefined();
const myData = response.body['singleResult']['data']['myData'];
// test the properties of myData ...
```
### Fluent interface of the fetcher stub
The fetcher stub has a fluent interface that allows you to create a stub in a 
declarative and readable way. This helps keeping the integration tests clean.
The interface is modeled after the structure of an HTTP request. It does not provide
any kind of validation though, to be open for writing tests with invalid requests.
The following Http methods are available:
```typescript
const fetcherStub = new FetcherStub()
const URL = 'htztp://localhost:4000/some-path'

fetcherStub.get(URL);
fetcherStub.head(URL);
fetcherStub.post(URL);
fetcherStub.put(URL);
fetcherStub.patch(URL);
fetcherStub.delete(URL);
fetcherStub.options(URL);
```

After specifying the HTTP method, you can add any header you need:
```typescript
fetcherStub.get(URL)
  .withHeader('Accept', 'application/json')
  .withHeader('User-Agent', 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion');
```

For POST or PATCH requests, you can also add a body like this:
```typescript
fetcherStub.get(URL)
  .withHeader('User-Agent', 'Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion');
  .withBody('{name:"Max"}', 'application/json')
```
The second parameter, the content type is optional. You could also use the withHeader function to specify a content type.

After specifying the request we need to configure what the response would be. 
This can be as simple as returning a status code:
```typescript
fetcherStub.get(URL)
  .responds()
  .withStatusCode(200);

// or alternatively
fetcherStub.get(URL)
  .responds()
  .withStatusCode(201)
  .withStatusText('Ok');

// or
fetcherStub.get(URL)
  .responds()
  .withStatus(201, 'Ok');
```

But if response headers and body are needed this is can be done like this:
```typescript
fetcherStub.get(URL)
  .responds()
  .withStatusCode(200)
  .withHeader('Server', 'Some Server')
  .withBody('{"name":"Max", "age":33}', 'application/json')
```
The second parameter, the content type is also optional and if desired the content 
type can be specified directly as a header.

With these functions even more complex scenarios can be handled. The fetcher stub collects the specification and uses it during the integration test. You could specify multiple different requests should that be necessary. Complex scenarios can be covered this way.

Here is an example how to stub an preflight request (CORS scenario):
```typescript
fetcherStub.options("/")
  .withHeader('Host', 'service.example.com')
  .withHeader('Origin', 'https://www.example.com')
  .withHeader('Access-Control-Request-Method', 'PUT')
  .responds()
  .withHeader('Access-Control-Allow-Origin', 'https://www.example.com')
  .withHeader('Access-Control-Allow-Methods', 'PUT')
  .withStatusCode(200)
  .withStatusText('Ok');
```
By adding multiple requests it is also possible to handle OAUTH scenarios. This is useful when you want 
to test login scenarios in a fast and reliable way.

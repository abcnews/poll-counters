# poll-counters

Manage our **firebase** `poll-counters` project, which stores counts for multiple-choice poll answers across many stories, allowing increments / totals via cloud functions.

## Getting started

Install **firebase**'s tools globally:

```sh
$ npm install --global firebase-tools
```

Install cloud functions dependencies locally:

```sh
$ cd functions
$ npm install
```

Read the [getting started](https://firebase.google.com/docs/functions/get-started) guide for working with cloud functions.

Don't have access to the [project](https://console.firebase.google.com/project/poll-counters/overview) on **firebase**? Email [Colin Gourlay](mailto:Gourlay.Colin@abc.net.au) with the Google account you would like associated with the project.

## API client

The `client/` directory of this project contains the source for a simple wrapper class for the API, which is published to npm as `@abcnews/poll-counters-client`. Have a look in `example.js` for usage examples.

import React, { Suspense } from 'react';
import ReactDOM from "react-dom/client";
import './index.css'
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import { ApolloClient, createHttpLink, InMemoryCache, ApolloProvider, split } from "@apollo/client";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from 'graphql-ws';
import { Dimmer, Loader, Segment } from 'semantic-ui-react'
import App from './App';
import store from 'store2'

const httpLink = createHttpLink({ uri: `http://localhost:5000/graphql` })

// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:5000/graphql`,
//   options: {
//     reconnect: true
//   }
// });
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:5000/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: store("token")
    }
  }
}));

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
})


const ClientApp = () => (
  <ApolloProvider client={client}>
    <Suspense fallback={<Segment><Dimmer active><Loader /></Dimmer></Segment>}>
      <App />
    </Suspense>
  </ApolloProvider>
);

store('contractId', '53bacb9a-ccbe-41ca-8d56-59ae092be826');
store('websiteId', 'e02427c6-fcb1-4e77-8d23-0f63ba67e678')
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ClientApp />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: "http://localhost:4002/graphql", // Change to your backend GraphQL server
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4002/graphql",
    connectionParams: {
      reconnect: true,
    },
  })
);

// Split requests between HTTP and WebSocket based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

// Create Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;

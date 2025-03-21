import { ApolloServer } from "@apollo/server";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const pubsub = new PubSub();

// GraphQL Type Definitions (Previously schema.graphql)
const typeDefs = `
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post]
    post(id: Int!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: Int!, title: String, content: String): Post!
    deletePost(id: Int!): Post!
  }

  type Subscription {
    postAdded: Post!
  }
`;

// Resolvers (Previously resolvers.js)
const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
    post: async (_, args) => await prisma.post.findUnique({ where: { id: args.id } }),
  },
  Mutation: {
    createPost: async (_, args) => {
      const post = await prisma.post.create({ data: args });
      pubsub.publish("POST_ADDED", { postAdded: post });
      return post;
    },
    updatePost: async (_, args) => {
      return await prisma.post.update({
        where: { id: args.id },
        data: { title: args.title, content: args.content },
      });
    },
    deletePost: async (_, args) => {
      return await prisma.post.delete({ where: { id: args.id } });
    },
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterableIterator(["POST_ADDED"]),
    },
  },
};

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startApolloServer() {
  const app = express();
  const httpServer = createServer(app);

  // WebSocket setup
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async () => ({ pubsub, prisma }),
    },
    wsServer
  );

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Use Express as middleware for Apollo
  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async () => ({ pubsub, prisma }),
    })
  );

  // Start the server
  httpServer.listen(4002, () => {
    console.log(`🚀 GraphQL API ready at http://localhost:4002/graphql`);
    console.log(`🛰️ WebSocket subscriptions ready at ws://localhost:4002/graphql`);
  });
}

startApolloServer();

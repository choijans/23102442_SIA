const { PrismaClient } = require("@prisma/client");
const { ApolloServer, gql } = require("apollo-server");

const prisma = new PrismaClient();

// Type Definitions (Previously schema.graphql)
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    updateUser(id: ID!, name: String, email: String): User!
    deleteUser(id: ID!): User!
  }
`;

// Resolvers (Previously resolvers.js)
const resolvers = {
  Query: {
    users: () => prisma.user.findMany(),
    user: (_, { id }) => prisma.user.findUnique({ where: { id: Number(id) } }),
  },
  Mutation: {
    createUser: (_, { name, email }) =>
      prisma.user.create({ data: { name, email } }),
    updateUser: (_, { id, name, email }) =>
      prisma.user.update({ where: { id: Number(id) }, data: { name, email } }),
    deleteUser: (_, { id }) => prisma.user.delete({ where: { id: Number(id) } }),
  },
};

// Apollo Server Setup (Previously server.js)
const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Users service running at ${url}`);
});

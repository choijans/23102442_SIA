const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = resolvers;

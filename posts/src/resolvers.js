const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const resolvers = {
  Query: {
    posts: () => prisma.post.findMany(),
    post: (_, { id }) => prisma.post.findUnique({ where: { id: Number(id) } }),
  },
  Mutation: {
    createPost: (_, { title, content }) =>
      prisma.post.create({ data: { title, content } }),
    updatePost: (_, { id, title, content }) =>
      prisma.post.update({ where: { id: Number(id) }, data: { title, content } }),
    deletePost: (_, { id }) => prisma.post.delete({ where: { id: Number(id) } }),
  },
};

module.exports = resolvers;

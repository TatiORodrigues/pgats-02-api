// app.js para ApolloServer
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const authenticate = require('./authenticate');

const app = express();

// Endpoint de health para checagem no workflow
app.get('/health', (req, res) => res.sendStatus(200));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authenticate(req)
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' }); // garante o path
}

const apolloReady = startApolloServer().then(() => app);

module.exports = apolloReady;

// server.js para ApolloServer

require('./app').then(app => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 GraphQL server running at http://localhost:${PORT}/graphql`);
  });
});

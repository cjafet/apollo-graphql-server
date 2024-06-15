const { ApolloServer } = require("apollo-server-express");
const { MongoClient } = require("mongodb");
const { readFileSync } = require("fs");
const resolvers = require("./src/resolvers");
const { createServer } = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { PubSub } = require("graphql-subscriptions");
const express = require("express");
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const cors = require("cors");
const { json } = require("body-parser");

require("dotenv").config();
const pubsub = new PubSub();

async function start() {
  var typeDefs = await readFileSync("./typeDefs.graphql", "UTF-8");
  const MONGO_DB = process.env.DB_HOST;
  console.log(MONGO_DB);

  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });

  const db = client.db();
  // const pubsub = PubSub();
  const context = { db, pubsub };

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express();
  const httpServer = createServer(app);

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/subscriptions",
  });

  wsServer.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      console.log("received: %s", data);
    });

    // ws.send('something');
  });

  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer({ schema }, wsServer);

  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    introspection: "stage", // turn off introspection by setting it to "production"
    context,
    csrfPrevention: false, // see below for more about this
    cors: {
      origin: [
        "http://localhost:4000",
        "https://studio.apollographql.com",
        "https://sandbox.embed.apollographql.com/sandbox/explorer",
      ],
      credentials: false,
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    // fieldResolver: defaultResolver,
  });
  await server.start();

  server.applyMiddleware({ app });

  // httpServer.listen({ port: process.env.PORT || 4000 }).then(({url}) => console.log(`GraphQL Service running on ${url}`))
  // binding to heroku dynamically assigned port
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    // console.log(`Server is now running on http://localhost:${PORT}${server.graphqlPath}`);
    console.log(
      `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

start();

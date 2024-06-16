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
const { createServer: createViteServer } = require("vite");
require("dotenv").config();
const pubsub = new PubSub();

async function start() {
  var typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

  const MONGO_DB = process.env.DB_HOST;
  console.log(MONGO_DB);

  const client = await MongoClient.connect(MONGO_DB, {
    useNewUrlParser: true,
  });

  const db = client.db();
  const context = { db, pubsub };

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  wsServer.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
      console.log("received: %s", data);
    });

    // ws.send('something');
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx) => {
        return {
          db,
          pubsub,
        };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    introspection: "stage", // turn off introspection by setting it to "production"
    context,
    csrfPrevention: false, // see below for more about this
    cors: {
      origin: [
        "https://graphql-5a92c0ee750b.herokuapp.com",
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

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  server.applyMiddleware({ app });

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

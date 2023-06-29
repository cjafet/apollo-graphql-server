const { ApolloServer } = require('apollo-server')
const { MongoClient } = require('mongodb')
const { readFileSync } = require('fs')
const resolvers = require('./src/resolvers')

require('dotenv').config()
var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

async function start() {
  const MONGO_DB = process.env.DB_HOST

  const client = await MongoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true }
  )
  const db = client.db()

  const context = { db }

  const server = new ApolloServer({ typeDefs, resolvers, context })

  server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))

}

start()

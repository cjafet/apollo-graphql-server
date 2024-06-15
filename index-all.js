const { ApolloServer } = require('apollo-server')
const { MongoClient } = require('mongodb')
require('dotenv').config()


var _id = 0
var retros = [];
var teams = [
    { "productTeam": "POS", "productGroup": "POM" },
    { "productTeam": "PBS", "productGroup": "PBS" },
  ]


// Schema definition
const typeDefs = `
    input Item {
        description: String!
        likes: Int
    }

    input inputTeam {
        productGroup: String!
        productTeam: String!
    }

    input Retrospective {
        kudos: [Item]
        improvements: [Item]
        actionItems: [Item]
        lastActionItems: [Item]
        ownedBy: inputTeam!
        iteration: Int!
    }

    type Team {
        productGroup: String!
        productTeam: String!
        retrospectives: [Retros]
    }

    type RetroItem {
        description: String!
        likes: Int
    }

    type Retros {
        id: ID!
        kudos: [RetroItem]
        improvements: [RetroItem]
        actionItems: [RetroItem]
        lastActionItems: [RetroItem]
        ownedBy: Team
        iteration: Int!
    }

    type Query {
        totalRetros: Int!
        retrospective: [Retros]
        allRetrosByTeam(productTeam: String): [Retros]   
        retroByIterationAndTeam(productTeam: String, iteration: Int): [Retros]   
    }

    type Mutation {
        postRetro(input: Retrospective!): Retros!
    }
`


const resolvers = {
  Query: {
    totalRetros: (parent, args, { db }) => db.collection('retro').estimatedDocumentCount(),
    retrospective: (parent, args, { db }) => db.collection('retro').find().toArray(),
    allRetrosByTeam: (parent, args, { db }) => db.collection('retro').find({ 'ownedBy.productTeam': args.productTeam }).toArray(), 
    retroByIterationAndTeam: (parent, args, { db }) => db.collection('retro').find({ 'ownedBy.productTeam': args.productTeam, 'iteration': args.iteration }).toArray()
  },
  Mutation: {
    postRetro(parent, args, { db }) {
        console.log(args);
        var retrospective = {
            id: _id++,
            ...args.input
        }
        db.collection('retro').insertOne(retrospective)
        return retrospective;
    }
  },
  Team: {
    retrospectives: parent => {
      return retros.filter(r => r.ownedBy === parent.productTeam)
    }
  },
  Retros: {
    ownedBy: parent => {
        console.log(parent.ownedBy)
        return teams.find(t => t.productTeam === parent.ownedBy.productTeam)
    }
  }

}

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

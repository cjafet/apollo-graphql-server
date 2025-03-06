const { ObjectID } = require('mongodb')

module.exports = {
    
    totalRetros: (parent, args, { db }) => db.collection('retro').estimatedDocumentCount(),
    
    retrospectives: (parent, args, { db }) => db.collection('retro').find().toArray(),

    allTeams: (parent, args, { db }) => db.collection('retro').distinct('ownedBy.productTeam'),
    
    allRetrosByTeam: (parent, args, { db }) => db.collection('retro').find({ 'ownedBy.productTeam': args.productTeam }).toArray(), 
    
    retroByIterationAndTeam: (parent, args, { db }) => db.collection('retro').findOne({ 'ownedBy.productTeam': args.productTeam, 'iteration': args.iteration }),
    
    user: (parent, args, { db }) => db.collection('users').findOne({ 'user.userName': args.userName, 'user.password': args.password }) 

}
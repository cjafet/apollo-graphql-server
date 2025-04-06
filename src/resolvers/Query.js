import bcrypt from "bcryptjs";
const { ObjectID } = require('mongodb')

module.exports = {
    
    totalRetros: (parent, args, { db }) => db.collection('retro').estimatedDocumentCount(),
    
    retrospectives: (parent, args, { db }) => db.collection('retro').find().toArray(),

    allTeams: (parent, args, { db }) => db.collection('retro').distinct('ownedBy.productTeam'),
    
    allRetrosByTeam: (parent, args, { db }) => db.collection('retro').find({ 'ownedBy.productTeam': args.productTeam }).toArray(), 
    
    retroByIterationAndTeam: (parent, args, { db }) => db.collection('retro').findOne({ 'ownedBy.productTeam': args.productTeam, 'iteration': args.iteration }),
    
    user: (parent, args, { db }) => db.collection('users').findOne({ 'userName': args.userName, 'password': args.password }), 
    
    userSignIn: async (parent, args, { db }) => {
      let obj = {
        organization: "",
        team: [{
          name: "",
          users: [{
            name: "",
            email: ""
          }]
        }]
      };
      let res = await db.collection('users').findOne({
        // "organization": args.organization,
        "team.name": args.organization,
        "team.users.email": args.userName
        // "team.users.password": args.password
      });
      console.log(res);
      let team = res.team.filter(t => t.name === args.organization);
      console.log(team);
      let user = team[0].users.filter(u => u.email === args.userName);
      console.log("logged user", user);
      let isValid = bcrypt.compareSync(args.password, user[0].password);
      console.log(isValid, args.password, user[0].password);
      if (isValid) {
        obj.organization = res.organization;
        obj.team[0].name = team[0].name;
        obj.team[0].users[0].name = user[0].name;
        obj.team[0].users[0].email = user[0].email;
      } 

      return obj;
      
    }, 

}
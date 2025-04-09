const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb')

module.exports = {
    
    totalRetros: (parent, args, { db }) => db.collection('retro').estimatedDocumentCount(),
    
    retrospectives: (parent, args, { db }) => db.collection('retro').find().toArray(),

    allTeams: (parent, args, { db }) => db.collection('retro').distinct('ownedBy.productTeam'),

    allTeamsByOrg: (parent, args, { db }) => db.collection('users').findOne({ 'organization': args.org }),
    
    allRetrosByTeam: (parent, args, { db }) => db.collection('retro').find({ 'ownedBy.productTeam': args.productTeam }).toArray(), 
    
    retroByIterationAndTeam: (parent, args, { db }) => db.collection('retro').findOne({ 'ownedBy.productTeam': args.productTeam, 'iteration': args.iteration }),
    
    user: (parent, args, { db }) => db.collection('users').findOne({ 'userName': args.userName, 'password': args.password }), 
    
    userSignIn: async (parent, args, { db }) => {
      let obj = {
        organization: "",
        team: {
          name: "",
          users: {
            name: "",
            email: ""
          }
        }
      };
      let res = await db.collection('users').findOne({
        "team.name": args.team,
        "team.users.email": args.userName
      });
      console.log(res);
      let team = res.team.filter(t => t.name === args.team);
      console.log(team);
      let user = team[0].users.filter(u => u.email === args.userName);
      console.log("logged user", user);
      if (bcrypt.compareSync(args.password, user[0].password)) {
        obj.organization = res.organization;
        obj.team.name = team[0].name;
        obj.team.users.name = user[0].name;
        obj.team.users.email = user[0].email;
      } 

      return obj;
      
    }, 

}
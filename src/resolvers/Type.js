const { GraphQLScalarType } = require('graphql')
const { ObjectID } = require('mongodb')

var retros = [];
var teams = [
    { "productTeam": "POS", "productGroup": "POM" },
    { "productTeam": "PBS", "productGroup": "PBS" },
  ]

module.exports = {
    
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
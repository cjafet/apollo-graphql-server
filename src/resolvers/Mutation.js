const { ObjectId } = require('mongodb');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

module.exports = {

    postRetro(parent, args, { db }) {
        console.log(args);
        var retrospective = {
            ...args.input
        }
        db.collection('retro').insertOne(retrospective)
        return retrospective;
    },
    postItem(parent, args, { db }) {
        console.log(args);
        let obj = {};
        obj[args.input.type] = {
            itemId: uuidv4(),
            description: args.input.description,
            likes:0,
            type: args.input.type
        }
        console.log(obj);
        db.collection('retro').updateOne(
            {
                _id: new ObjectId(args.input._id)
            },
            {
                $push: obj
            }
        );
        return args.input;
    },
    deleteItem(parent, args, { db }) {
        console.log(args);
        const itemId = args.itemId;
        const itemType = args.type;
        const itemDesc = args.desc;
        console.log(itemType);  

        let obj = {};
        obj[itemType] = {
            description: ""
        };
        obj[itemType].description = itemDesc;
        obj[itemType].itemId = itemId;
        console.log("Obj: ",obj);
        db.collection('retro').updateOne(
            {
                _id: new ObjectId(args._id)
            },
            {
                $pull: obj
            }
        );
        return args.desc;      
    },
    addItemLike(parent, args, { db }) {
        console.log(args);
        const itemType = args.type;
        const itemDesc = args.desc;
        console.log(itemType, itemDesc);  
        const _type = `${args.type}.description`;
        const _like = `${args.type}.$.likes`;

        db.collection("retro").findOneAndUpdate(
            {
                _id: new ObjectId(args._id), 
                [_type]: itemDesc
            }, 
            { $inc: { [_like] : 1 } } 
        )

        return args.desc;      
    }

}
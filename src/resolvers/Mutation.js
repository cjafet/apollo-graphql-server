const { ObjectId } = require("mongodb");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  postRetro(parent, args, { db }) {
    console.log(args);
    var retrospective = {
      ...args.input,
    };
    db.collection("retro").insertOne(retrospective);
    return retrospective;
  },
  signUp(parent, args, { db }) {
    console.log(args);
    const email = args.input.email;
    const organization = args.input.organization;
    const userName = args.input.userName;
    const password = args.input.password;
    const newTeam = {};
    newTeam.name = args.input.team;
    newTeam.users = [];
    newTeam.hash = uuidv4();
    const team = [newTeam];

    let user = {
      email,
      organization,
      userName,
      password,
      team
    };

    db.collection("users").insertOne(user);
    // generate and send otp
    return user;
  },
  userSignUp(parent, args, { db }) {
    console.log(args);
    const hash = args.input.hash;
    const team = args.input.team;
    const name = args.input.name;
    const email = args.input.email;
    const password = args.input.password;

    let user = {
      name,
      email,
      password,
    };
    
    db.collection("users").findOneAndUpdate(
      {
        "team.name": team,
        "team.hash": hash
      },
      { $push: { "team.$.users": user } }
    );
    // generate and send otp
    return user;
  },
  addTeam(parent, args, { db, pubsub }) {
    console.log(args);
    const newTeam = args.teamName;
    const organization = args.organization;
    console.log(newTeam, organization);
    
    let team = {
      name: newTeam,
      users: [],
      hash: uuidv4()
    }
    let obj = {};
    obj.team = team

    db.collection("users").findOneAndUpdate(
      {
        "organization": organization
      },
      { $push: obj }
    );

    return args.teamName;
  },
  postItem(parent, args, { db, pubsub }) {
    console.log(args);
    let obj = {};
    const ID = uuidv4();
    obj[args.input.type] = {
      itemId: ID,
      description: args.input.description,
      likes: 0,
      type: args.input.type,
    };
    console.log(obj);
    db.collection("retro").updateOne(
      {
        _id: new ObjectId(args.input._id),
      },
      {
        $push: obj,
      }
    );

    pubsub
      .publish("ITEM_ADDED", {
        itemAdded: {
          itemId: ID,
          description: args.input.description,
          likes: 0,
          type: args.input.type,
        },
      })
      .then(() => console.log("Worked"))
      .catch((err) => console.log(err));

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
      description: "",
    };
    obj[itemType].description = itemDesc;
    obj[itemType].itemId = itemId;
    console.log("Obj: ", obj);
    db.collection("retro").updateOne(
      {
        _id: new ObjectId(args._id),
      },
      {
        $pull: obj,
      }
    );
    return args.desc;
  },
  addItemLike(parent, args, { db }) {
    console.log(args);
    const itemId = args.itemId;
    const itemType = args.type;
    const itemDesc = args.desc;
    console.log(itemType, itemDesc);
    const _itemId = `${args.type}.itemId`;
    const _type = `${args.type}.description`;
    const _like = `${args.type}.$.likes`;

    db.collection("retro").findOneAndUpdate(
      {
        _id: new ObjectId(args._id),
        [_itemId]: itemId,
        [_type]: itemDesc,
      },
      { $inc: { [_like]: 1 } }
    );

    return args.desc;
  },
  addTodayMood(parent, args, { db }) {
    console.log(args);
    const iteration = args.iteration;
    const key = args.key;
    console.log(iteration, key);
    const _mood = `moods[$key]`;

    // Await for response
    db.collection("retro").findOneAndUpdate(
      {
        _id: new ObjectId(args._id),
        iteration: iteration,
      },
      { $inc: { [_mood]: 1 } }
    );

    return JSON.stringify({ iteration, key, status: `Added 1 to ${_mood}`});
  },
  moveItemTo(parent, args, { db }) {
    console.log(args);
    const itemId = args.input.itemId;
    const itemType = args.input.type;
    const itemDesc = args.input.description;
    const itemLikes = args.input.likes;

    let obj = {};
    obj[itemType] = {
      description: "",
    };
    obj[itemType].description = itemDesc;
    obj[itemType].itemId = itemId;
    console.log("Obj: ", obj);

    let toObj = {};
    toObj[args.moveTo] = {
      description: "",
    };
    toObj[args.moveTo].description = itemDesc;
    toObj[args.moveTo].itemId = itemId;
    toObj[args.moveTo].likes = itemLikes;
    toObj[args.moveTo].type = args.moveTo;
    console.log("toObj: ", toObj);

    db.collection("retro").updateOne(
      {
        _id: new ObjectId(args.input._id),
      },
      {
        $push: toObj,
        $pull: obj,
      }
    );

    return args.input;
  },
  postOkr(parent, args, { db }) {
    console.log(args);
    var newOkr = {
      year: args.year,
      ownedBy: args.ownedBy,
      q1: [],
      q2: [],
      q3: [],
      q4: []
    };
    db.collection("okrs").insertOne(newOkr);
    return newOkr;
  },
  postObjective(parent, args, { db, pubsub }) {
    console.log(args);
    let obj = {};
    const ID = uuidv4();
    obj[args.input.quarter] = {
      objectId: ID,
      title: args.input.title,
      owner: args.input.owner,
      dueDate: args.input.dueDate,
      status: args.input.status,
    };
    console.log(obj);
    db.collection("okrs").updateOne(
      {
        _id: new ObjectId(args.input._id),
      },
      {
        $push: obj,
      }
    );

    // pubsub
    //   .publish("ITEM_ADDED", {
    //     itemAdded: {
    //       itemId: ID,
    //       description: args.input.description,
    //       likes: 0,
    //       type: args.input.type,
    //     },
    //   })
    //   .then(() => console.log("Worked"))
    //   .catch((err) => console.log(err));

    return obj[args.input.quarter];
  },
};

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
        itemAdded: args.input
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
  moveItem(parent, args, { db }) {
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
    toObj["actionItems"] = {
      description: "",
    };
    toObj["actionItems"].description = itemDesc;
    toObj["actionItems"].itemId = itemId;
    toObj["actionItems"].likes = itemLikes;
    toObj["actionItems"].type = "actionItems";
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
};

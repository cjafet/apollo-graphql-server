module.exports = {
  itemAdded: {
    subscribe: (parent, args, { db, pubsub }) => {
      console.log(pubsub);
      return pubsub.asyncIterator("ITEM_ADDED");
    },
  },
};

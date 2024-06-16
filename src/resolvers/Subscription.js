module.exports = {
  itemAdded: {
    subscribe: (parent, args, { db, pubsub }) => {
      return pubsub.asyncIterator(["ITEM_ADDED"]);
    },
  },
};

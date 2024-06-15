const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

module.exports = {
  itemAdded: {
    subscribe: (parent, args, context) => {
      return pubsub.asyncIterator("ITEM_ADDED");
    },
  },
  numberIncremented: {
    subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
  },
};

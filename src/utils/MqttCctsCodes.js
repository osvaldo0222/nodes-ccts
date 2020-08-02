const Messages = {
  NODE_DISCONNECT: {
    code: 700,
    description: "Node disconnect from broker",
  },
  NODE_CONNECT: {
    code: 701,
    description: "Node connect to broker",
  },
  WEB_SERVER_SEND_CONFIG: {
    code: 702,
    description: "Server send configuration to the last node connected",
  },
  WEB_SERVER_DISCONNECT: {
    code: 703,
    description: "Server disconnected from broker",
  },
  NODE_NOT_FOUND: {
    code: 704,
    description: "Node identifier can't be found",
  },
  VISIT_MESSAGE_FROM_NODE: {
    code: 705,
    description: "New visit message from a node",
  },
  WEB_SERVER_CONNECT: {
    code: 706,
    description: "Server connect to broker",
  },
  UNKNOWN: {
    code: 0,
    description: "Unknow code received",
  },
};

module.exports.Messages = Object.freeze(Messages);

module.exports.getByCode = (code) => {
  for (const key in Messages) {
    if (Messages[key].code === code) {
      return Object.freeze(Messages[key]);
    }
  }
  return Object.freeze(Messages.UNKNOWN);
};

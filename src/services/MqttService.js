const mqtt = require("mqtt");
const { CCTS_CONSTANTS, NODE_CONSTANTS } = require("../utils/Constants");

const configTopic = `${CCTS_CONSTANTS.CONFIG_TOPIC}/${NODE_CONSTANTS.NODE_IDENTIFIER}`;

const client = mqtt.connect(CCTS_CONSTANTS.BROKER_URL, {
  clientId: NODE_CONSTANTS.NODE_IDENTIFIER,
  username: CCTS_CONSTANTS.BROKER_USERNAME,
  password: CCTS_CONSTANTS.BROKER_PASSWORD,
  will: {
    topic: configTopic,
    payload: JSON.stringify({
      code: 700,
      nodeIdentifier: NODE_CONSTANTS.NODE_IDENTIFIER,
      nodeStatus: 1,
    }),
    qos: 1,
  },
});

client.on("connect", () => {
  client.subscribe(configTopic, (err) => {
    if (!err) {
      client.publish(
        configTopic,
        JSON.stringify({
          code: 701,
          nodeIdentifier: NODE_CONSTANTS.NODE_IDENTIFIER,
          nodeStatus: 2,
        }),
        { qos: 1 }
      );
    }
  });
});

client.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString());
});

exports.client;

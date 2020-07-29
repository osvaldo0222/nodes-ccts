const {
  CCTS_CONSTANTS: {
    BROKER_USERNAME,
    BROKER_PASSWORD,
    BROKER_URL,
    CONFIG_TOPIC,
    MSB_64_UUID_CCTS,
  },
  NODE_CONSTANTS: { NODE_IDENTIFIER },
} = require("./utils/Constants");

const Application = function () {
  this.services = {};

  this.initialize = (services = {}) => {
    this.services = services;

    this.services.MqttService.initialize(
      (generalConfigurationTopic = CONFIG_TOPIC),
      (nodeIdentifier = NODE_IDENTIFIER),
      (brokerUrl = BROKER_URL),
      (brokerUsername = BROKER_USERNAME),
      (brokerPassword = BROKER_PASSWORD)
    );

    this.services.BleService.initialize((cctsUuidPart = MSB_64_UUID_CCTS));
  };
};

module.exports.Application = Application;

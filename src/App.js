const {
  CCTS_CONSTANTS: {
    BROKER_USERNAME,
    BROKER_PASSWORD,
    BROKER_URL,
    CONFIG_TOPIC,
    MESSAGE_TOPIC,
    MSB_64_UUID_CCTS,
  },
  NODE_CONSTANTS: { NODE_IDENTIFIER, DEVICE_FORGET_TIME },
} = require("./utils/Constants");

const Application = function () {
  this.services = {};

  this.initialize = (services = {}) => {
    this.services = services;

    this.services.MqttService.initialize(
      (generalMessageTopic = MESSAGE_TOPIC),
      (generalConfigurationTopic = CONFIG_TOPIC),
      (nodeIdentifierInit = NODE_IDENTIFIER),
      (brokerUrlInit = BROKER_URL),
      (brokerUsernameInit = BROKER_USERNAME),
      (brokerPasswordInit = BROKER_PASSWORD)
    );

    this.services.BleService.initialize((cctsUuidPart = MSB_64_UUID_CCTS));

    this.services.CCTSService.initialize(
      (deviceForgetTime = DEVICE_FORGET_TIME)
    );
  };
};

module.exports.Application = Application;

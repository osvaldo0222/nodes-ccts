module.exports.cctsProps = {
  MSB_64_UUID_CCTS: "1ad73f5c2d4845e9",
  BROKER_URL: "tcp://192.168.10.8:1883",
  BROKER_USERNAME: "ccts",
  BROKER_PASSWORD: "ccts",
  CONFIG_TOPIC_GENERAL: "/config",
  MESSAGE_TOPIC_GENERAL: "/nodes",
  WEB_SERVER_STATUS_TOPIC: "/web-server-status",
  WEB_SERVER_STATUS: false,
};

module.exports.mqttProps = {
  NODE_IDENTIFIER: "NODE-1",
  CONFIG_TOPIC: null,
  MESSAGE_TOPIC: null,
  LOCALITY: null,
  mqttCLient: null,
  qos: 1,
};

module.exports.bleProps = {
  DEVICE_FORGET_TIME: 10000, //Miliseconds
};

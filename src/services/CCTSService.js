const { bleProps, mqttProps } = require("../shared/Props");
const { deleteDev, getDev } = require("./BleService");
const { generateMqttMessage, sendMessage } = require("./MqttService");
const { Messages } = require("../utils/MqttCctsCodes");

const CCTSService = function () {
  this.initialize = () => {
    setInterval(() => {
      let devices = getDev();
      let toSend = [];
      if (devices) {
        for (let value of Object.keys(devices)) {
          let now = new Date().getTime();
          let timeDeviceWithoutUpdates = now - devices[value].timeLeft;
          if (timeDeviceWithoutUpdates >= bleProps.DEVICE_FORGET_TIME) {
            toSend.push(devices[value]);
            deleteDev(value);
          }
        }
      }

      //TEMP
      if (toSend.length) {
        let message = generateMqttMessage(
          (code = Messages.VISIT_MESSAGE_FROM_NODE),
          (nodeIdentifier = mqttProps.NODE_IDENTIFIER),
          (data = toSend)
        );

        sendMessage((topic = mqttProps.MESSAGE_TOPIC), (message = message));
      }
    }, 1000);
  };
};

module.exports = CCTSService;

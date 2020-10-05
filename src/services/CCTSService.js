const logger = require("log4js").getLogger();
const { bleProps, mqttProps, cctsProps } = require("../shared/Props");
const { deleteDev, getBleDB } = require("./BleService");
const { generateMqttMessage, sendMessage } = require("./MqttService");
const { Messages } = require("../utils/MqttCctsCodes");

const CCTSService = function () {
  this.initialize = () => {
    setInterval(() => {
      if (cctsProps.WEB_SERVER_STATUS) {
        let db = getBleDB();
        db.find({}, (err, devices) => {
          if (err) {
            logger.error("Error finding records...");
          } else {
            let toSend = [];
            if (devices) {
              devices.forEach(element => {
                let now = new Date().getTime();
                let timeDeviceWithoutUpdates = now - element.timeLeft;
                if (timeDeviceWithoutUpdates >= bleProps.DEVICE_FORGET_TIME) {
                  toSend.push(element);
                  deleteDev(element.uuid);
                }
              });
            }

            if (toSend.length) {
              let message = generateMqttMessage(
                (code = Messages.VISIT_MESSAGE_FROM_NODE),
                (nodeIdentifier = mqttProps.NODE_IDENTIFIER),
                (data = toSend)
              );

              sendMessage((topic = mqttProps.MESSAGE_TOPIC), (message = message));
            }
          }
        });
      }
    }, 1000);
  };
};

module.exports = CCTSService;

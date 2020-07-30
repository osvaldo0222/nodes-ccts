const { bleProps, mqttProps } = require("../shared/Props");

const CCTSService = function ({ BleService, MqttService }) {
  this.BleService = BleService;
  this.MqttService = MqttService;

  this.initialize = () => {
    setInterval(() => {
      let devices = bleProps.DEVICES;
      let toSend = [];
      if (devices) {
        for (let value of Object.keys(devices)) {
          let now = new Date().getTime();
          let timeDeviceWithoutUpdates = now - devices[value].timeLeft;
          if (timeDeviceWithoutUpdates >= bleProps.DEVICE_FORGET_TIME) {
            toSend.push(devices[value]);
            this.BleService.deleteDev(value);
          }
        }
      }

      //TEMP
      if (toSend.length) {
        let message = this.MqttService.generateMqttMessage(
          (code = 705),
          (nodeIdentifier = mqttProps.NODE_IDENTIFIER),
          (data = toSend)
        );

        this.MqttService.sendMessage(
          (topic = mqttProps.MESSAGE_TOPIC),
          (message = message)
        );
      }

      console.clear();
      console.log(devices);
    }, 1000);
  };
};

module.exports = CCTSService;

const CCTSService = function ({ BleService, MqttService }) {
  this.BleService = BleService;
  this.MqttService = MqttService;
  this.deviceForgetTime = null;

  this.initialize = (deviceForgetTime = 10000) => {
    this.deviceForgetTime = deviceForgetTime;

    setInterval(() => {
      let devices = this.BleService.getDev();
      if (devices) {
        for (let value of Object.keys(devices)) {
          let now = new Date().getTime();
          let timeDeviceWithoutUpdates = now - devices[value].timeLeft;
          if (timeDeviceWithoutUpdates >= this.deviceForgetTime) {
            this.BleService.deleteDev(value);
          }
        }
      }
      console.clear();
      console.log(devices);
    }, 1000);
  };
};

module.exports = CCTSService;

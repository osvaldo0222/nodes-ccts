const CCTSService = function ({ BleService, MqttService }) {
  this.initialize = () => {
    setTimeout(() => {
      if (BleService.dev) {
        for (let value of Object.keys(BleService.dev)) {
          let now = new Date().getUTCMilliseconds();
          console.log(value, now);
        }
      }
    }, 1000);
  };
};

module.exports = CCTSService;

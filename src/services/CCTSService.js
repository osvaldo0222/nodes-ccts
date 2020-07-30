const CCTSService = function (BleService, MqttService) {
  this.initialize = () => {
    setTimeout(() => {
      for (const [key, value] of BleService.dev) {
        let now = new Date().getUTCMilliseconds();
        console.log(value, now);
      }
    }, 1000);
  };
};

module.exports = CCTSService;

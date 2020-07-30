const Application = function () {
  this.services = {};

  this.initialize = (services = {}) => {
    this.services = services;

    this.services.MqttService.initialize();

    this.services.BleService.initialize();

    this.services.CCTSService.initialize();
  };
};

module.exports.Application = Application;

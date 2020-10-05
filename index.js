//Banner
const showBanner = require("node-banner");

//Logger
const { configure } = require("log4js");

//Entry point of the application
const Application = require("./src/App").Application;

//Services of the application
const BootstrapService = require("./src/services/BootstrapService");
const MqttService = require("./src/services/MqttService");
const BleService = require("./src/services/BleService");
const CCTSService = require("./src/services/CCTSService");

//Configuring the logger
configure({
  appenders: {
    file: { type: "file", filename: "./logs/ccts.log" },
    console: { type: "console" },
  },
  categories: { default: { appenders: ["file", "console"], level: "debug" } },
});

//Instance all the services
const servicesInstances = {};
servicesInstances.BootstrapService = new BootstrapService();
servicesInstances.MqttService = new MqttService();
servicesInstances.BleService = new BleService();
servicesInstances.CCTSService = new CCTSService();

//Instance and start the application
const app = new Application();
(async () => {
  await showBanner("CCTS NODES", "This is the JS program for the nodes\n");
})().then(() => {
  app.initialize(servicesInstances);
});

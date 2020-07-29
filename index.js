//Entry point of the application
const Application = require("./src/App").Application;

//Services of the application
const MqttService = require("./src/services/MqttService");
const BleService = require("./src/services/BleService");

//Instance all the services
const services = {};
services.MqttService = new MqttService();
services.BleService = new BleService();

//Instance and start the application
const app = new Application();
app.initialize(services);

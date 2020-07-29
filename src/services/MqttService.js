const mqtt = require("mqtt");

const MqttService = function () {
  this.nodeIdentifier = null;
  this.brokerCredentials = {
    username: null,
    password: null,
  };
  this.brokerUrl = null;
  this.configTopic = null;
  this.messageTopic = null; //TODO
  this.locality = null; //TODO
  this.mqttClient = null;

  this.initialize = (
    generalConfigurationTopic = "/config",
    nodeIdentifier = "NODE-#",
    brokerUrl = "tcp://192.168.0.12:1883",
    brokerUsername = "ccts",
    brokerPassword = "ccts"
  ) => {
    this.nodeIdentifier = nodeIdentifier;
    this.brokerCredentials.username = brokerUsername;
    this.brokerCredentials.password = brokerPassword;
    this.brokerUrl = brokerUrl;
    this.configTopic = `${generalConfigurationTopic}/${this.nodeIdentifier}`;

    this.mqttClient = mqtt.connect(this.brokerUrl, {
      clientId: this.nodeIdentifier,
      ...this.brokerCredentials,
      will: {
        topic: this.configTopic,
        payload: this.generateMqttMessage(700, this.nodeIdentifier, {
          nodeStatus: 1,
        }),
        qos: 1,
      },
    });

    this.mqttClient.on("connect", () => {
      this.mqttClient.subscribe(this.configTopic, (err) => {
        if (!err) {
          this.sendMessage(
            this.configTopic,
            this.generateMqttMessage(701, this.nodeIdentifier, {
              nodeStatus: 2,
            })
          );
        }
      });
    });

    this.mqttClient.on("message", function (topic, message) {
      // message is Buffer
      console.log(message.toString());
    });
  };

  this.sendMessage = (topic = this.messageTopic, message = "") => {
    if (this.mqttClient) {
      this.mqttClient.publish(topic, message, { qos: 1 }, (err) => {
        //Sucess or error here
      });
    }
  };

  this.generateMqttMessage = (code, nodeIdentifier, data) => {
    return JSON.stringify({
      code: code,
      nodeIdentifier: nodeIdentifier,
      data: data,
    });
  };
};

module.exports = MqttService;

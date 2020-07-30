const mqtt = require("mqtt");

const MqttService = function () {
  this.nodeIdentifier = null;
  this.brokerCredentials = {
    username: null,
    password: null,
  };
  this.brokerUrl = null;
  this.configTopic = null;
  this.messageTopic = null;
  this.locality = null;
  this.mqttClient = null;

  this.initialize = (
    generalMessageTopic = "/nodes",
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
        payload: this.generateMqttMessage(700, this.nodeIdentifier, null),
        qos: 1,
      },
    });

    this.mqttClient.on("connect", () => {
      this.mqttClient.subscribe(this.configTopic, (err) => {
        if (!err) {
          this.sendMessage(
            this.configTopic,
            this.generateMqttMessage(701, this.nodeIdentifier, null)
          );
        }
      });
    });

    this.mqttClient.on("message", function (topic, message) {
      let msgObj = JSON.parse(message.toString());
      let code = msgObj.code;
      if (code) {
        switch (code) {
          case 700:
            console.log("[...] Node is disconnect to broker");
            break;
          case 701:
            console.log(
              "[...] Node is connected to the broker on",
              brokerUrl,
              "with identifier",
              nodeIdentifier
            );
            break;
          case 702:
            this.locality = msgObj.data;
            this.messageTopic = `${generalMessageTopic}/${this.locality.localityName}/${this.locality.nodeDescription}`
              .toLowerCase()
              .replace(" ", "");
            console.log("[...] Node data topic is", this.messageTopic);
            break;
          case 704:
            //NODE NOT FOUND
            break;
          default:
            console.log(
              "[...] Something wrong happend. You received a msg with a unknown code:",
              msgObj
            );
            break;
        }
      }
    });
  };

  this.sendMessage = (topic = this.messageTopic, message = "") => {
    console.log(topic, message);
    if (this.mqttClient) {
      this.mqttClient.publish(topic, message, { qos: 1 }, (err) => {
        //Sucess or error here
      });
    }
  };

  this.generateMqttMessage = (
    code = 705,
    nodeIdentifier = this.nodeIdentifier,
    data = null
  ) => {
    return JSON.stringify({
      code: code,
      nodeIdentifier: nodeIdentifier,
      data: data,
    });
  };
};

module.exports = MqttService;

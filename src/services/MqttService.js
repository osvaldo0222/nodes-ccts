const mqtt = require("mqtt");
const { mqttProps, cctsProps } = require("../shared/Props");

const MqttService = function () {
  this.initialize = () => {
    mqttProps.CONFIG_TOPIC = `${cctsProps.CONFIG_TOPIC_GENERAL}/${mqttProps.NODE_IDENTIFIER}`;

    mqttProps.mqttCLient = mqtt.connect(cctsProps.BROKER_URL, {
      clientId: mqttProps.NODE_IDENTIFIER,
      username: cctsProps.BROKER_USERNAME,
      password: cctsProps.BROKER_PASSWORD,
      will: {
        topic: mqttProps.CONFIG_TOPIC,
        payload: this.generateMqttMessage(700, mqttProps.NODE_IDENTIFIER, null),
        qos: 1,
      },
    });

    mqttProps.mqttCLient.on("connect", () => {
      mqttProps.mqttCLient.subscribe(mqttProps.CONFIG_TOPIC, (err) => {
        if (!err) {
          this.sendMessage(
            mqttProps.CONFIG_TOPIC,
            this.generateMqttMessage(701, mqttProps.NODE_IDENTIFIER, null)
          );
        }
      });
    });

    mqttProps.mqttCLient.on("message", function (topic, message) {
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
              cctsProps.BROKER_URL,
              "with identifier",
              mqttProps.NODE_IDENTIFIER
            );
            break;
          case 702:
            mqttProps.LOCALITY = msgObj.data;
            mqttProps.MESSAGE_TOPIC = `${cctsProps.MESSAGE_TOPIC_GENERAL}/${mqttProps.LOCALITY.localityName}/${mqttProps.LOCALITY.nodeDescription}`
              .toLowerCase()
              .replace(" ", "");
            console.log("[...] Node data topic is", mqttProps.MESSAGE_TOPIC);
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

  this.sendMessage = (topic = mqttProps.MESSAGE_TOPIC, message = "") => {
    console.log(topic, message);
    if (mqttProps.mqttCLient) {
      mqttProps.mqttCLient.publish(topic, message, { qos: 1 }, (err) => {
        //Sucess or error here
      });
    }
  };

  this.generateMqttMessage = (
    code = 705,
    nodeIdentifier = mqttProps.NODE_IDENTIFIER,
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

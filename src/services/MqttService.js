const logger = require("log4js").getLogger();
const mqtt = require("mqtt");
const { mqttProps, cctsProps } = require("../shared/Props");
const {
  Messages: {
    NODE_DISCONNECT,
    NODE_CONNECT,
    NODE_NOT_FOUND,
    WEB_SERVER_SEND_CONFIG,
    WEB_SERVER_DISCONNECT,
    WEB_SERVER_CONNECT,
    VISIT_MESSAGE_FROM_NODE,
    UNKNOWN,
  },
  getByCode,
} = require("../utils/MqttCctsCodes");

const MqttService = function () {
  this.initialize = () => {
    //Configuration topic to this node
    mqttProps.CONFIG_TOPIC = `${cctsProps.CONFIG_TOPIC_GENERAL}/${mqttProps.NODE_IDENTIFIER}`;

    //MqttClient instance
    mqttProps.mqttCLient = mqtt.connect(cctsProps.BROKER_URL, {
      clientId: mqttProps.NODE_IDENTIFIER,
      username: cctsProps.BROKER_USERNAME,
      password: cctsProps.BROKER_PASSWORD,
      will: {
        topic: mqttProps.CONFIG_TOPIC,
        payload: generateMqttMessage(
          NODE_DISCONNECT,
          mqttProps.NODE_IDENTIFIER,
          null
        ),
        qos: mqttProps.qos,
      },
    });

    //This event occurs whenever the connection is established (CONNACK messsage)
    mqttProps.mqttCLient.on("connect", () => {
      logger.info(
        `Node is connected to the broker on ${cctsProps.BROKER_URL} with clientId ${mqttProps.NODE_IDENTIFIER}`
      );

      //Suscribe to /config/{nodeIdentifier}
      mqttProps.mqttCLient.subscribe(
        mqttProps.CONFIG_TOPIC,
        { qos: mqttProps.qos },
        (err) => {
          subscribedResult(mqttProps.CONFIG_TOPIC, err, () => {
            sendMessage(
              mqttProps.CONFIG_TOPIC,
              generateMqttMessage(NODE_CONNECT, mqttProps.NODE_IDENTIFIER, null)
            );
          });
        }
      );

      //Suscribe to /web-server-status
      mqttProps.mqttCLient.subscribe(
        cctsProps.WEB_SERVER_STATUS_TOPIC,
        { qos: mqttProps.qos },
        (err) => {
          subscribedResult(cctsProps.WEB_SERVER_STATUS_TOPIC, err, null);
        }
      );
    });

    //This event occurs whenever the node go offline
    mqttProps.mqttCLient.on("offline", (error) => {
      setWebStatusServer(false);
      logger.warn(
        `Node is working offline. Trying to connect to broker on ${cctsProps.BROKER_URL}...`
      );
    });

    //This event occurs with every message received by the topics
    mqttProps.mqttCLient.on("message", function (topic, message) {
      let msgObj = JSON.parse(message.toString());
      let code = getByCode(msgObj.code);
      if (code) {
        switch (code) {
          case NODE_DISCONNECT:
            //You will never get this message, unless something recorded happens
            logger.error("Node is disconnected to broker");
            break;
          case NODE_CONNECT:
            logger.info(
              `${mqttProps.NODE_IDENTIFIER} confirmed by mqtt server`
            );
            break;
          case WEB_SERVER_SEND_CONFIG:
            mqttProps.LOCALITY = msgObj.data;
            mqttProps.MESSAGE_TOPIC = `${cctsProps.MESSAGE_TOPIC_GENERAL}/${mqttProps.LOCALITY.localityName}/${mqttProps.LOCALITY.nodeDescription}`
              .toLowerCase()
              .replace(" ", "");
            logger.info(`Node data topic is ${mqttProps.MESSAGE_TOPIC}`);
            setWebStatusServer(true);
            break;
          case WEB_SERVER_DISCONNECT:
            setWebStatusServer(false);
            break;
          case NODE_NOT_FOUND:
            setWebStatusServer(true);
            break;
          case VISIT_MESSAGE_FROM_NODE:
            //You will never get this message, unless something recorded happens
            logger.error("Visit message loop!!!!!!!!!");
            break;
          case WEB_SERVER_CONNECT:
            setWebStatusServer(true);
            sendMessage(
              mqttProps.CONFIG_TOPIC,
              generateMqttMessage(NODE_CONNECT, mqttProps.NODE_IDENTIFIER, null)
            );
            break;
          default:
            logger.warn(
              `Something wrong happend. You received a msg with a unknown code: ${msgObj}`
            );
            break;
        }
      }
    });
  };
};

/**
 * Function that generates messages that are used in the CCTS application protocol
 *
 * @param {*} code
 * @param {*} nodeIdentifier
 * @param {*} data
 */
function generateMqttMessage(
  code = VISIT_MESSAGE_FROM_NODE,
  nodeIdentifier = mqttProps.NODE_IDENTIFIER,
  data = null
) {
  return JSON.stringify({
    code: code.code,
    nodeIdentifier: nodeIdentifier,
    data: data === null ? code.description : data,
  });
}

/**
 * Function to send messages by MQTT
 *
 * @param {*} topic
 * @param {*} message
 */
function sendMessage(topic = mqttProps.MESSAGE_TOPIC, message = "") {
  if (mqttProps.mqttCLient) {
    mqttProps.mqttCLient.publish(
      topic,
      message,
      { qos: mqttProps.qos },
      (err) => {
        if (err) {
          logger.error(`Can't send the message to the topic ${topic}`);
        }
      }
    );
  }
}

/**
 * Function to set application server status
 *
 * @param {*} status
 */
function setWebStatusServer(status) {
  if (cctsProps.WEB_SERVER_STATUS === status) {
    return;
  }
  cctsProps.WEB_SERVER_STATUS = status;
  logger.info(`Application server is ${status ? "ACTIVE" : "DOWN"}`);
}

/**
 *
 *
 * @param {*} topic
 * @param {*} err
 * @param {*} callback
 */
function subscribedResult(topic, err, callback = null) {
  if (!err) {
    if (callback) {
      callback();
    }
    logger.info(`Subscribed to topic: ${topic}`);
  } else {
    logger.error(`Unable to subscribed to topic: ${topic}`);
  }
}

module.exports = MqttService;
module.exports.generateMqttMessage = generateMqttMessage;
module.exports.sendMessage = sendMessage;

// collector.js
// connects to personal TTN feed using Node.js SDK
// stores data in mongodb database

import * as ttn from "ttn";
import { insertDocument } from "./lib/influxdb";

const user = process.env.MQTT_USER;
const password = process.env.MQTT_PASSWORD;

console.log("trying to connect to TTN console...");
ttn
  .data(user, password)
  .then(function (client) {
    console.log("success!");
    console.log("waiting for data from nodes...");
    // as soon as ttn app receives uploads from
    client.on("uplink", function (devID, payload) {
      console.log(payload)
      const messageObject = {
        device: payload["dev_id"],
        counter: payload["counter"],
        tod: new Date().toJSON().slice(0, 19).replace(/T/g, " "),
        fields: payload["payload_fields"],
        payload: payload["payload_raw"],
        metadata: payload["metadata"],
      };
      console.log("*** \n Received uplink from: ", devID, "\n*** ")
      insertDocument(messageObject);
      console.log("data was susccessfully written into collection", "\nwaiting from data from nodes...")
    })
  })
  .catch(function (error) {
    console.error("Error - couldn`t connect to TTN console.", error);
    process.exit(1);
  });

function exitHandler(options, err): void {
  if (err) {
    console.error("Application exiting...", err);
  }
  process.exit();
}

process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

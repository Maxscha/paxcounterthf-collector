// collector.js
// connects to personal TTN feed using Node.js SDK
// stores data in mongodb database

import * as ttn from "ttn";
import { insertDocument } from "./lib/influxdb";

const user = process.env.MQTT_USER;
const password = process.env.MQTT_PASSWORD;

const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const PORT = 3000

function convertPayload(payload) {
  return {
    device: payload["dev_id"],
    counter: payload["counter"],
    tod: new Date().toJSON().slice(0, 19).replace(/T/g, " "),
    fields: payload["payload_fields"],
    payload: payload["payload_raw"],
    metadata: payload["metadata"],
  };

}


console.log("trying to connect to TTN console...");
ttn
  .data(user, password)
  .then(function (client) {
    console.log("success!");
    console.log("waiting for data from nodes...");
    // as soon as ttn app receives uploads from
    client.on("uplink", function (devID, payload) {
      console.log(payload)
      const messageObject = convertPayload(payload);
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

// Tell express to use body-parser's JSON parsing
app.use(bodyParser.json())

app.post("/hook", (req, res) => {
  console.log("Payload from webhook")
  console.log(req.body)
  const payload = req.body;
  const messageObject = convertPayload(payload);
  console.log("*** \n Received uplink from Webhook, \n*** ")
  insertDocument(messageObject);
  console.log("data was susccessfully written into collection", "\nwaiting from data from nodes...")
  res.status(200).end() // Responding is important
})


// Start express on the defined port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


process.on("exit", exitHandler.bind(null, { cleanup: true }));
process.on("SIGINT", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));

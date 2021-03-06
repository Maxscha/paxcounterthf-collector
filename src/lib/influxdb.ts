const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client')
const { hostname } = require('os')

// connects to personal mongodb + defines funtion to store data
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const url = process.env['INFLUX_URL'] || "http://influxdb:8086"
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN']
const username = process.env['INFLUX_USER']
const password = process.env['INFLUX_PASSWORD']
/** Organization within InfluxDB  */
// const org = process.env['INFLUX_ORG']
/**InfluxDB bucket used in examples  */
const bucket = process.env['INFLUX_BUCKET']

// importing module "mongodb"
const writeApi = new InfluxDB({ url: url, token: `${username}:${password}` }).getWriteApi('', bucket)


export async function insertDocument(data) {
  try {
    var point = new Point('feld_pax_count')
      .tag('sensor', data["device"])
      .floatField('ingoing', data["fields"]["field3"])
      .floatField('outgoing', data["fields"]["field4"])
      .timestamp(new Date()); // can be also a number, but in writeApi's precision units (s, ms, us, ns)!
    writeApi.writePoint(point);
    writeApi.flush()
  }
  catch (e) {
    console.error(e)
  }

}
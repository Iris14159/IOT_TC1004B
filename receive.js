/*----------------------------------------------------------
 * receive.js
 *
 * Date: 21-Nov-2023
 * Authors:
 *           A01799387 Renato Garcia Moran
 *           A01798048 Maximilisno De La Cruz Lima
 *           A01798199 Fidel Alexander Bonilla Montalvo
 *----------------------------------------------------------*/
const { EventHubConsumerClient, earliestEventPosition } = require("@azure/event-hubs");
const { ContainerClient } = require("@azure/storage-blob");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");
const { connectionString, eventHubName, consumerGroup, storageConnectionString, containerName } = require("./keys");
const fs = require('fs');

async function main() {
  const containerClient = new ContainerClient(storageConnectionString, containerName);
  const checkpointStore = new BlobCheckpointStore(containerClient);
  const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName, checkpointStore);


  fs.writeFileSync('eventData.json', '[\n');

  const subscription = consumerClient.subscribe(
    {
      processEvents: async (events, context) => {
        for (const event of events) {
          console.log(`Received event: Object from partition: '${context.partitionId}'`);
          
          fs.appendFileSync('eventData.json', JSON.stringify(event.body, null, 2) + ",\n");
        }
        await context.updateCheckpoint(events[events.length - 1]);
      },
      processError: async (error, context) => {
        console.log(`Error : ${error}`);
      }
    },
    { startPosition: earliestEventPosition }
  );

  // Mantener el programa en ejecución
  await new Promise(resolve => { });
}

function closeJsonFile() {
  let data = fs.readFileSync('eventData.json', 'utf8').trim();
  if (data.endsWith(',')) {
    data = data.substring(0, data.length - 1);
  }
  fs.writeFileSync('eventData.json', data + '\n]');
  console.log('JSON file closed.');
}

function handleExit() {
  closeJsonFile();
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

main().catch((err) => {
  console.log("Error occurred: ", err);
});

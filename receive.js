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

  let eventData = [];

  const subscription = consumerClient.subscribe({
      processEvents: async (events, context) => {
        if (events.length === 0) {
          console.log(`No events received within wait time. Waiting for next interval`);
          return;
        }

        for (const event of events) {
          console.log(`Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`);
          eventData.push(event.body);
        }

        await context.updateCheckpoint(events[events.length - 1]);
      },

      processError: async (err, context) => {
        console.log(`Error : ${err}`);
      }
    },
    { startPosition: earliestEventPosition }
  );

  await new Promise((resolve) => {
    setTimeout(async () => {
      await subscription.close();
      await consumerClient.close();
      fs.writeFile('eventData.json', JSON.stringify(eventData, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
      });
      resolve();
    }, 30000);
  });
}

main().catch((err) => {
  console.log("Error occurred: ", err);
});
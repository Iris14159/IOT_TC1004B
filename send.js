const { EventHubProducerClient } = require("@azure/event-hubs");
const { connectionString, eventHubName } = require("./keys");

async function main() {

  const producer = new EventHubProducerClient(connectionString, eventHubName);

  const batch = await producer.createBatch();
  batch.tryAdd({ body: "First event" });
  batch.tryAdd({ body: "Second event" });
  batch.tryAdd({ body: "Third event" });    

  await producer.sendBatch(batch);

  // Close the producer client.
  await producer.close();

  console.log("A batch of three events have been sent to the event hub");
}

main().catch((err) => {
  console.log("Error occurred: ", err);
});
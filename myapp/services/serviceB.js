// services/rabbitmqPublisher.js
const amqp = require('amqplib');

const rabbitmqURL = 'amqp://localhost:5672'; // RabbitMQ URL
const queueName = 'posts_queue'; // Queue name

async function publishPost() {
  const connection = await amqp.connect(rabbitmqURL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  // Generate synthetic data (you can modify this logic)
  const syntheticPost = {
    title: `Post ${Math.floor(Math.random() * 10000)}`,
    content: `This is a synthetic post content generated at ${new Date().toISOString()}.`,
  };

  console.log("Publishing post:", syntheticPost);

  // Publish the message to the queue
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(syntheticPost)), {
    persistent: true,
  });

  // Close the connection after sending the message
  setTimeout(() => {
    connection.close();
  }, 500);
}

setInterval(publishPost, 5000); // Publish a post every 5 seconds (for demo purposes)


const amqp = require('amqplib');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Use dynamic import for node-fetch

const rabbitmqURL = 'amqp://localhost:5672'; // RabbitMQ URL
const queueName = 'posts_queue'; // Queue name

async function consumeMessage() {
  const connection = await amqp.connect(rabbitmqURL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);

  // Consume messages from the queue
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString());
      console.log("Received message:", message);
      
      // Call your GraphQL mutation to insert this data into the post table
      try {
        const response = await fetch('http://localhost:4002/graphql', { // URL of your GraphQL server
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              mutation CreatePost($title: String!, $content: String!) {
                createPost(title: $title, content: $content) {
                  id
                  title
                  content
                }
              }
            `,
            variables: {
              title: message.title,
              content: message.content,
            },
          }),
        });

        const data = await response.json();
        console.log('Post created:', data);
      } catch (error) {
        console.error('Error creating post:', error);
      }

      // Acknowledge the message
      channel.ack(msg);
    }
  });
}

consumeMessage().catch(console.error);

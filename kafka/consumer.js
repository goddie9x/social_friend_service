const friendService = require('../services/friendService');
const { kafkaClient, Consumer } = require('./init');
const { FRIEND_TOPIC } = require('../constants/kafkaTopic');

const activeFriendServiceConsumer = () => {
    const friendServiceConsumer = new Consumer(kafkaClient, [{ topic: FRIEND_TOPIC.REQUEST }], { autoCommit: true });

    friendServiceConsumer.on('message', async (messages) => {

        try {
            const { action, ...data } = JSON.parse(messages.value);

            if (typeof friendService[action] === 'function') {
                response = await friendService[action](data);
            }
        } catch (error) {
            console.error('Error processing Kafka message:', error);
        }
    });

    friendServiceConsumer.on('error', (err) => {
        console.error('Kafka Consumer error:', err);
    });
}

module.exports = { activeFriendServiceConsumer };

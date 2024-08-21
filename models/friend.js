const mongoose = require('../configs/database');
const { SenderMustDifferentWithReceiverException } = require('../exceptions/friendExceptions');
const { TargetNotExistException } = require('../exceptions/commonExceptions');
const { sendKafkaMessageThenReceiveResult } = require('../kafka/producer');
const { USER_TOPIC } = require('../constants/kafkaTopic');
const {FRIENDSHIP} = require('../constants/friend');

const Schema = mongoose.Schema;

const friendshipArray = Object.values(FRIENDSHIP);

const FriendSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    friendshipType: {
        type: String,
        enum: friendshipArray, 
        default: FRIENDSHIP.FRIEND,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date,
    },
    isAccepted: {
        type: Boolean,
        default: false
    }
});

FriendSchema.index({ sender: 1, receiver: 1 });
FriendSchema.index({ receiver: 1, sender: 1 });

FriendSchema.pre('save', async function (next) {
    try {
        if (this.sender.equals(this.receiver)) {
            throw new SenderMustDifferentWithReceiverException();
        }
        const getSenderUserById = sendKafkaMessageThenReceiveResult({
            topic: USER_TOPIC.REQUEST, messages: {
                action: 'getUserById',
                params: {
                    id: this.sender
                }
            }
        });
        const getReceiverUserById = sendKafkaMessageThenReceiveResult({
            topic: USER_TOPIC.REQUEST, messages: {
                action: 'getUserById',
                params: {
                    id: this.receiver
                }
            }
        });
        const [senderResponse, receiverResponse] = await Promise.all(
            [getSenderUserById,
                getReceiverUserById]
        );
        const senderExists = senderResponse && senderResponse.user;
        const receiverExists = receiverResponse && receiverResponse.user;

        if (!senderExists || !receiverExists) {
            throw new TargetNotExistException('Either the sender or the receiver does not exist.');
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Friend = mongoose.model('Friend', FriendSchema);

module.exports = Friend;
const mongooseConnection = require('../configs/database');
const mongoose = require('mongoose');
const { SenderMustDifferentWithReceiverException } = require('../exceptions/friendExceptions');
const { TargetNotExistException } = require('../utils/exceptions/commonExceptions');
const { FRIENDSHIP } = require('../constants/friend');
const { userServiceClient, userMessages } = require('../grpc/userClient');

const Schema = mongoose.Schema;
const friendshipArray = Object.values(FRIENDSHIP);

const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const userIdString = userId.toString();
        const request = new userMessages.GetUserByIdRequest();
        request.setId(userIdString);

        userServiceClient.getUserById(request, (error, response) => {
            if (error) {
                return reject(error);
            }
            const user = {
                id: response.getId(),
                username: response.getUsername(),
            };

            resolve(user);
        });
    })
}

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
        const getSenderUserById = getUserById(this.sender);
        const getReceiverUserById = getUserById(this.receiver);
        const [senderResponse, receiverResponse] = await Promise.all(
            [getSenderUserById,
                getReceiverUserById]
        );
        const senderExists = senderResponse && senderResponse.id;
        const receiverExists = receiverResponse && receiverResponse.id;
        
        if (!senderExists || !receiverExists) {
            throw new TargetNotExistException('Either the sender or the receiver does not exist.');
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Friend = mongooseConnection.model('Friend', FriendSchema);

module.exports = Friend;
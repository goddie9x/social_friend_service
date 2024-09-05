const mongooseConnection = require('../configs/database');
const mongoose = require('mongoose');
const { SenderMustDifferentWithReceiverException } = require('../exceptions/friendExceptions');
const { TargetNotExistException } = require('../utils/exceptions/commonExceptions');
const { FRIENDSHIP } = require('../constants/friend');
const { getListUserByIds } = require('../grpc/userClient');

const Schema = mongoose.Schema;
const friendshipArray = Object.values(FRIENDSHIP);

const FriendSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
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

FriendSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
FriendSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

FriendSchema.pre('save', async function (next) {
    try {
        if (this.sender.equals(this.receiver)) {
            throw new SenderMustDifferentWithReceiverException();
        }
        const response = await getListUserByIds([this.sender, this.receiver]);
        if (!response || !response.users || response.users?.length < 2) {
            throw new TargetNotExistException('Either the sender or the receiver does not exist.');
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Friend = mongooseConnection.model('Friend', FriendSchema);

module.exports = Friend;
const Friend = require('../models/friend');
const BasicService = require('../utils/services/basicService');
const { FRIENDSHIP } = require('../constants/friend');
const { TargetAlreadyExistException, TargetNotExistException, BadRequestException } = require('../utils/exceptions/commonExceptions');
const { sendCreateNotificationKafkaMessage } = require('../utils/kafka/producer');
const { TYPE: NOTIFICATION_TYPE } = require('../utils/constants/notification');
const { GEN_FRIEND_REQUEST_LIST_ROUTE } = require('../utils/constants/clientRoute');
const USER_CONSTANTS = require('../utils/constants/users');
const { IncorrectPermission } = require('../utils/exceptions/commonExceptions');
class FriendService extends BasicService {
    constructor() {
        super();
        this.getPaginatedResults = this.getPaginatedResults.bind(this);
        this.getFriendRequestsWithPagination = this.getFriendRequestsWithPagination.bind(this);
        this.getFriendListWithPagination = this.getFriendListWithPagination.bind(this);
    }

    async getFriendRequestsWithPagination({ id, currentUser, page = 1, limit = 10 }) {
        if (id != currentUser.userId && currentUser.role == USER_CONSTANTS.ROLES.USER) {
            throw new IncorrectPermission();
        }
        
        const query = {
            receiver: id,
            isAccepted: false
        };

        const { results: friendRequests, totalDocuments: totalRequests, totalPages } =
            await this.getPaginatedResults({ model: Friend, query, page, limit });

        return {
            page,
            limit,
            totalRequests,
            totalPages,
            friendRequests
        };
    }

    async getFriendListWithPagination({ id, currentUser, page = 1, limit = 10 }) {
        if (id != currentUser.userId && currentUser.role == USER_CONSTANTS.ROLES.USER) {
            throw new IncorrectPermission();
        }

        const query = {
            $or: [
                { sender: id },
                { receiver: id }
            ],
            isAccepted: true
        };

        const { results: friendList, totalDocuments: totalFriends, totalPages } =
            await this.getPaginatedResults({ model: Friend, query, page, limit });

        return {
            page,
            limit,
            totalFriends,
            totalPages,
            friendList
        };
    }

    async addFriend({ currentUser, receiverId, friendshipType }) {
        const senderId = currentUser.userId;

        if (senderId === receiverId) {
            throw new BadRequestException('Sender and receiver cannot be the same person.');
        }

        const existingFriend = await Friend.findOne({
            $or: [{
                sender: senderId, receiver: receiverId,
            },
            {
                receiver: receiverId, receiver: senderId
            }]
        });

        if (existingFriend) {
            throw new TargetAlreadyExistException('A Friend already exists between these users.');
        }
        const friendship = new Friend({
            sender: senderId,
            receiver: receiverId,
            friendshipType: friendshipType || FRIENDSHIP.FRIEND
        });

        await friendship.save();
        sendCreateNotificationKafkaMessage(
            {
                target: friendship.receiver,
                type: NOTIFICATION_TYPE.FRIEND_REQUEST,
                content: `New friend request <user>${friendship.sender}</user>`,
                href: GEN_FRIEND_REQUEST_LIST_ROUTE(friendship.sender)
            }
        );
        return friendship;
    }
    async acceptRequest({ id, currentUser }) {
        const friendRequest = await Friend.findOne({
            _id: id,
            receiver: currentUser.userId,
            isAccepted: false
        });

        if (!friendRequest) {
            throw new TargetNotExistException('Friend request not found or already accepted.');
        }

        friendRequest.isAccepted = true;
        friendRequest.acceptedAt = Date.now();
        await friendRequest.save();

        sendCreateNotificationKafkaMessage(
            {
                target: friendRequest.sender,
                type: NOTIFICATION_TYPE.FRIEND_REQUEST,
                content: `<user>${friendRequest.receiver}</user> accepted your friend request`,
                href: GEN_FRIEND_REQUEST_LIST_ROUTE(friendRequest.receiver)
            }
        );
        return friendRequest;
    }
    async refuseRequest({ id, currentUser }) {
        const friendRequest = await Friend.findOneAndDelete({
            _id: id,
            $or: [
                { receiver: currentUser.userId },
                { sender: currentUser.userId }
            ],
            isAccepted: false
        });

        if (!friendRequest) {
            throw new TargetNotExistException('Friend request not found or already accepted.');
        }
    }
    async deleteFriendship({ id, currentUser }) {
        const friendRequest = await Friend.findOneAndDelete({
            _id: id,
            $or: [
                { receiver: currentUser.userId },
                { sender: currentUser.userId }
            ],
            isAccepted: true
        });

        if (!friendRequest) {
            throw new TargetNotExistException('Friendship not found or already accepted.');
        }
    }
    async getFriendshipInfo({ id, currentUser }) {
        const friendship = await Friend.findOne({
            _id: id,
            receiver: currentUser.userId
        });

        if (!friendship) {
            throw new TargetNotExistException('Friendship not found.');
        }

        return friendship;
    }
}

module.exports = new FriendService();
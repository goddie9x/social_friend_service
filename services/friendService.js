const Friend = require('../models/friend');
const { FRIENDSHIP } = require('../constants/friend');
const { TargetAlreadyExistException, TargetNotExistException, BadRequestException } = require('../util/exceptions/commonExceptions');

class FriendService {
    constructor() {
        this.getPaginatedResults = this.getPaginatedResults.bind(this);
        this.getFriendRequestsWithPagination = this.getFriendRequestsWithPagination.bind(this);
        this.getFriendListWithPagination = this.getFriendListWithPagination.bind(this);
    }

    async getPaginatedResults(query, page, limit) {
        const skip = (page - 1) * limit;

        const results = await Friend.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalDocuments = await Friend.countDocuments(query);

        return {
            results,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limit)
        };
    }

    async getFriendRequestsWithPagination(req) {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const query = {
            receiver: userId,
            isAccepted: false
        };

        const { results: friendRequests, totalDocuments: totalRequests, totalPages } =
            await this.getPaginatedResults(query, page, limit);

        return {
            page,
            limit,
            totalRequests,
            totalPages,
            friendRequests
        };
    }

    async getFriendListWithPagination(req) {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const query = {
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            isAccepted: true
        };

        const { results: friendList, totalDocuments: totalFriends, totalPages } =
            await this.getPaginatedResults(query, page, limit);

        return {
            page,
            limit,
            totalFriends,
            totalPages,
            friendList
        };
    }

    async addFriend(req) {
        const { currentUser, receiverId, friendshipType } = req.body;
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

        return friendship;
    }
    async acceptRequest(req) {
        const { id } = req.params;
        const { currentUser } = req.body;

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

        return friendRequest;
    }
    async refuseRequest(req) {
        const { id } = req.params;
        const { currentUser } = req.body;

        const friendRequest = await Friend.findOneAndDelete({
            _id: id,
            receiver: currentUser.userId,
            isAccepted: false
        });

        if (!friendRequest) {
            throw new TargetNotExistException('Friend request not found or already accepted.');
        }
    }
    async getFriendshipInfo(req) {
        const { id } = req.params;
        const { currentUser } = req.body;

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
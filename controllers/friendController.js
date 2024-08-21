const friendService = require('../services/friendService');

class FriendController {
    constructor() {
        this.addFriend = this.addFriend.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.getFriendList = this.getFriendList.bind(this);
        this.getFriendshipInfo = this.getFriendshipInfo.bind(this);
    }
    handleResponseError(res, error) {
        if (error instanceof CommonException) {
            return res.status(error.statusCode).json(error.message);
        }
        return res.status(500).json({ message: 'Something went wrong, please try again' });
    }
    async index(req, res) {
        try {
            const friendRequestsWithPagination =
                await friendService.getFriendRequestsWithPagination(req);

            return res.json({ ...friendRequestsWithPagination });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getFriendList(req, res) {
        try {
            const friendListWithPagination = await friendService.getFriendListWithPagination(req);

            return res.json({ ...friendListWithPagination });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async addFriend(req, res) {
        try {
            const friendship = await friendService.addFriend(req);

            return res.status(201).json({ message: 'Friend request sent.', friendship });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async acceptRequest(req, res) {
        try {
            const friendRequest = await friendService.acceptRequest(req);

            res.json({ message: 'Friend request accepted.', friendRequest });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async refuseRequest(req, res) {
        try {
            await friendService.refuseRequest(req);

            res.json({ message: 'Friend request refused.' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getFriendshipInfo(req, res) {
        try {
            const friendship = await friendService.getFriendshipInfo(req);

            return res.json(friendship);
        } catch (error) {
            return this.handleResponseError(res,error);
        }
    }
}

module.exports = new FriendController();
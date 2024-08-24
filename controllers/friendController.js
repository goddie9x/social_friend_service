const friendService = require('../services/friendService');
const { CommonException } = require('../utils/exceptions/commonExceptions');

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
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong, please try again' });
    }
    async index(req, res) {
        try {
            const payloads = { id: req.params.id, ...req.query };
            const friendRequestsWithPagination =
                await friendService.getFriendRequestsWithPagination(payloads);

            return res.json({ ...friendRequestsWithPagination });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getFriendList(req, res) {
        try {
            const payloads = { id: req.params.id, ...req.query };
            const friendListWithPagination = await friendService.getFriendListWithPagination(payloads);

            return res.json({ ...friendListWithPagination });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async addFriend(req, res) {
        try {
            const friendship = await friendService.addFriend(req.body);
            return res.status(201).json({ message: 'Friend request sent.', friendship });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async acceptRequest(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            const friendRequest = await friendService.acceptRequest(payloads);

            res.json({ message: 'Friend request accepted.', friendRequest });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async refuseRequest(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };

            await friendService.refuseRequest(payloads);

            res.json({ message: 'Friend request refused.' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getFriendshipInfo(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            const friendship = await friendService.getFriendshipInfo(payloads);

            return res.json(friendship);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
}

module.exports = new FriendController();
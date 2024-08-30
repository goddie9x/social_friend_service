const friendService = require('../services/friendService');
const BasicController = require('../utils/controllers/basicController');

class FriendController extends BasicController {
    constructor() {
        super();
        this.index = this.index.bind(this)
        this.addFriend = this.addFriend.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.getFriendList = this.getFriendList.bind(this);
        this.getFriendshipInfo = this.getFriendshipInfo.bind(this);
        this.refuseRequest = this.refuseRequest.bind(this);
    }
    async index(req, res) {
        try {
            const payloads = { id: req.params.id, ...req.query, currentUser: req.body.currentUser };
            const friendRequestsWithPagination =
                await friendService.getFriendRequestsWithPagination(payloads);

            return res.json({ ...friendRequestsWithPagination });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }

    async getFriendList(req, res) {
        try {
            const payloads = { id: req.params.id, ...req.query, currentUser: req.body.currentUser };
            const friendListWithPagination = await friendService.getFriendListWithPagination(payloads);

            return res.json({ ...friendListWithPagination });
        } catch (error) {
            return this.handleResponseError(res, error);
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
    async deleteFriendship(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };

            await friendService.deleteFriendship(payloads);

            res.json({ message: 'Friendship refused.' });
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
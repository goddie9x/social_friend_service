const friendController = require('../controllers/friendController');

const mapNormalUserRoute = router=>{
    router.get('/requests/:userId',friendController.index);
    router.get('/friend-list/:userId',friendController.index);
    router.post('/detail/:id',friendController.getFriendshipInfo);
    router.post('/add',friendController.addFriend);
    router.put('/accept/:id',friendController.acceptRequest);
    router.delete('/refuse/:id',friendController.refuseRequest);
}

module.exports = mapNormalUserRoute;
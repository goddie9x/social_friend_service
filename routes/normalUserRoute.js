const friendController = require('../controllers/friendController');

const mapNormalUserRoute = router=>{
    router.get('/requests/:id',friendController.index);
    router.get('/friend-list/:id',friendController.getFriendList);
    router.post('/add',friendController.addFriend);
    router.put('/accept/:id',friendController.acceptRequest);
    router.delete('/refuse/:id',friendController.refuseRequest);
    router.post('/detail/:id',friendController.getFriendshipInfo);
}

module.exports = mapNormalUserRoute;
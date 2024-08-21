const grpc = require('@grpc/grpc-js');

const userProto = require('../generated/user_grpc_pb');
const userMessages = require('../generated/user_pb');

const userServiceClient = new userProto.UserServiceClient(
    process.env.USER_SERVICE_GRPC_ADDRESS || 'localhost:50051',
    grpc.credentials.createInsecure()
);


module.exports = {
    userServiceClient,
    userMessages
}
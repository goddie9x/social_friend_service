const { CommonException } = require('../utils/exceptions/commonExceptions');

class SenderMustDifferentWithReceiverException extends CommonException {
    constructor(message, statusCode, errorCode) {
        super(message || 'Sender must different with receiver', statusCode || 400, errorCode || 400);
    }
}

module.exports = { SenderMustDifferentWithReceiverException };
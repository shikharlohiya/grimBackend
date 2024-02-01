const TestingAPI = function () {};

TestingAPI.prototype.testingAPIFunc = function (req, res, callback) {
    // Assuming 'err' needs to be defined
    const err = null; 

    if (err) {
        throw err;
    } else {
        // Returning a string indicating that the API is working
        callback(null, "API is working");
    }
};

module.exports = new TestingAPI();



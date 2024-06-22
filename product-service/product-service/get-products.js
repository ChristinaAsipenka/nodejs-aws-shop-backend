const data = require('./products');
exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": 'GET, POST, OPTIONS',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    };
};
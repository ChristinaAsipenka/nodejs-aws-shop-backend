const products = require('./products');

const getProductById = (id) => {
    return products.find(product => product.id === id);
};

exports.handler = async (event) => {

    const id = event.pathParameters && event.pathParameters.id;
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": 'GET',
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json"
    };

    if (!id) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: "ID parameter is required" }),
        };
    }

    const product = getProductById(id);

    if (product) {
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ product }),
        };
    } else {
        return {
            statusCode: 404,
            headers: headers,
            body: JSON.stringify({ message: "Product not found" }),
        };
    }
};
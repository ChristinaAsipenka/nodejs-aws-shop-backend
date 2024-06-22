const products = require('./products');

// Function to find a product by id
const getProductById = (id) => {
    return products.find(product => product.id === id);
};

exports.handler = async (event) => {

    // Extract id from query string parameters or event body
    const id = parseInt(event.pathParameters.id, 10);

    if (!id) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "ID parameter is required" }),
        };
    }

    const product = getProductById(id);

    if (product) {
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Product found", product }),
        };
    } else {
        return {
            statusCode: 404,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Product not found" }),
        };
    }
};
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const getProductById = async (id) => {

    const productParams = {
        TableName: process.env.PRODUCTS_TABLE,
        Key: { id }
    };
    const productData = await ddbDocClient.send(new GetCommand(productParams));

    if (!productData.Item) {
        return null;
    }

    const stockParams = {
        TableName: process.env.STOCKS_TABLE,
        Key: { product_id: id }
    };
    const stockData = await ddbDocClient.send(new GetCommand(stockParams));

    const product = {
        ...productData.Item,
        count: stockData.Item ? stockData.Item.count : 0 
    };

    return product;
};

exports.handler = async (event) => {
    const id = event.pathParameters && event.pathParameters.id;
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": 'GET,POST,OPTIONS',
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

    try {
        const product = await getProductById(id);

        if (product) {
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(product),
            };
        } else {
            return {
                statusCode: 404,
                headers: headers,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }
    } catch (err) {
        console.error(`Unable to fetch product. Error: ${JSON.stringify(err, null, 2)}`);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: "Unable to fetch product" }),
        };
    }
};
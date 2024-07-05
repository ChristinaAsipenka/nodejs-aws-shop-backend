const { randomUUID } = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    for (const record of event.Records) {
        const requestBody = JSON.parse(record.body);
        const { title, description, price, count } = requestBody;

        if (!title || !description || !price || count === undefined || count < 0) {
            console.error('Missing or invalid required fields:', requestBody);
            continue; // Skip invalid records
        }

        const productId = randomUUID();

        const newProduct = {
            id: productId,
            title,
            description,
            price,
        };

        const paramsProduct = {
            TableName: process.env.PRODUCTS_TABLE,
            Item: newProduct,
        };

        const paramsStock = {
            TableName: process.env.STOCKS_TABLE,
            Item: {
                product_id: productId,
                count: count,
            },
        };

        try {
            await ddbDocClient.send(new PutCommand(paramsProduct));
            await ddbDocClient.send(new PutCommand(paramsStock));

            console.log('Product created successfully:', newProduct);
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Batch process completed' }),
    };
};
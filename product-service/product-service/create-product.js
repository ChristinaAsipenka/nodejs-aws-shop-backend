const { randomUUID } = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { title, description, price, count } = requestBody;

  if (!title || !description || !price || count === undefined || count < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing or invalid required fields' }),
    };
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
    
    await ddbDocClient.send(
        new PutCommand(paramsProduct)
    );

    await ddbDocClient.send(
        new PutCommand(paramsStock)
    );

    const productResponce = {
        id: productId,
        count: count,
        price: price,
        title: title,
        description: description
      };

    return {
      statusCode: 201,
      body: JSON.stringify(productResponce),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create product', error }),
    };
  }
};
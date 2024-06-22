const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const productsParams = {
        TableName: 'products',
      };
      const productsData = await ddbDocClient.send(new ScanCommand(productsParams));
  
      const stocksParams = {
        TableName: 'stocks',
      };
      const stocksData = await ddbDocClient.send(new ScanCommand(stocksParams));
  
      const stocksMap = {};
      for (const stock of stocksData.Items) {
        stocksMap[stock.product_id] = stock.count;
      }
  
      const combinedData = productsData.Items.map(product => ({
        ...product,
        count: stocksMap[product.id] || 0,
      }));
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": 'GET, POST, OPTIONS',
          "Access-Control-Allow-Origin": '*',
          "Content-Type": "application/json"
        },
        body: JSON.stringify(combinedData),
      };
  } catch (err) {
    console.error(`Unable to fetch products. Error: ${JSON.stringify(err, null, 2)}`);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": 'GET, POST, OPTIONS',
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: 'Unable to fetch products' }),
    };
  }
};
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: 'eu-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const productsTable = 'products';
const stocksTable = 'stocks';

const testProducts = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Product 1',
    description: 'Description for product 1',
    price: 100
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Product 2',
    description: 'Description for product 2',
    price: 200
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    title: 'Product 3',
    description: 'Description for product 3',
    price: 300
  }
];

const testStocks = [
  {
    product_id: '123e4567-e89b-12d3-a456-426614174000',
    count: 10
  },
  {
    product_id: '123e4567-e89b-12d3-a456-426614174001',
    count: 20
  },
  {
    product_id: '123e4567-e89b-12d3-a456-426614174002',
    count: 30
  }
];

const addProduct = async (product) => {
  const params = {
    TableName: productsTable,
    Item: product
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log(`Added product: ${product.title}`);
  } catch (err) {
    console.error(`Unable to add product: ${product.title}. Error: ${JSON.stringify(err, null, 2)}`);
  }
}; 

const addStock = async (stock) => {
  const params = {
    TableName: stocksTable,
    Item: stock
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log(`Added stock for product ID: ${stock.product_id}`);
  } catch (err) {
    console.error(`Unable to add stock for product ID: ${stock.product_id}. Error: ${JSON.stringify(err, null, 2)}`);
  }
};

const main = async () => {
  for (const product of testProducts) {
    await addProduct(product);
  }

  for (const stock of testStocks) {
    await addStock(stock);
  }

  console.log('Test data insertion complete.');
};

main().catch(err => console.error(err));

const getProducts = require('../product-service/get-products');

// Mock environment variables
process.env.PRODUCTS_TABLE = 'products';
process.env.STOCKS_TABLE = 'stocks';

describe('getProducts Lambda Function Test', () => {
    it('should return correct response structure', async () => {
        const event = {};
        const result = await getProducts.handler(event);

        expect(result).toBeDefined();
        expect(result.statusCode).toBe(200);
        expect(result.headers).toEqual({
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": 'GET, POST, OPTIONS',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json"
        });

        const responseBody = JSON.parse(result.body);
        expect(responseBody).toBeDefined();
        expect(responseBody).toEqual(expect.any(Array));
    });
});
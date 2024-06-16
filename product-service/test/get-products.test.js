const getProducts = require('../product-service/get-products');

describe('getProducts Lambda Function Test', () => {
    it('should return correct response structure', async () => {
        const event = {};
        const result = await getProducts.handler(event);

        expect(result).toBeDefined();
        expect(result.statusCode).toBe(200);
        expect(result.headers).toEqual({
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": '*',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json"
        });

        const responseBody = JSON.parse(result.body);
        expect(responseBody.products).toBeDefined();
        expect(responseBody.products).toEqual(expect.any(Array));
    });
});
const { handler } = require('../product-service/get-product');
const products = require('../product-service/products');

describe('handler', () => {
    let mockEvent;

    beforeEach(() => {
        mockEvent = {
            pathParameters: {}
        };
    });

    test('should return 400 if id is missing', async () => {
        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe("ID parameter is required");
    });

    test('should return 404 if product is not found', async () => {
        mockEvent.pathParameters.id = 'nonexistentId';
        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body).message).toBe("Product not found");
    });

    test('should return 200 with product if found', async () => {
        const mockProduct = { id: 'existingId', title: 'Test Product' };
        jest.spyOn(products, 'find').mockReturnValueOnce(mockProduct);

        mockEvent.pathParameters.id = 'existingId';
        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(mockProduct);
    });
});
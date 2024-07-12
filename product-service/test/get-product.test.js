const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('../product-service/get-product');

// Mock environment variables
process.env.PRODUCTS_TABLE = 'products';
process.env.STOCKS_TABLE = 'stocks';

// Mock the AWS SDK client methods
jest.mock('@aws-sdk/lib-dynamodb', () => {
    return {
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn(),
            }),
        },
        GetCommand: jest.fn(),
    };
});

describe('handler', () => {
    let mockEvent;
    let ddbDocClientMock;

    beforeEach(() => {
        mockEvent = {
            pathParameters: {},
        };
        ddbDocClientMock = DynamoDBDocumentClient.from().send;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if id is missing', async () => {
        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe('ID parameter is required');
    });

    test('should return 404 if product is not found', async () => {
        mockEvent.pathParameters.id = 'nonexistentId';

        ddbDocClientMock.mockResolvedValueOnce({ Item: undefined });

        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body).message).toBe('Product not found');
    });

    test('should return 200 with product if found', async () => {
        const mockProductData = { Item: { id: 'existingId', title: 'Test Product' } };
        const mockStockData = { Item: { product_id: 'existingId', count: 10 } };

        ddbDocClientMock.mockResolvedValueOnce(mockProductData);
        ddbDocClientMock.mockResolvedValueOnce(mockStockData);

        mockEvent.pathParameters.id = 'existingId';
        const response = await handler(mockEvent);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            id: 'existingId',
            title: 'Test Product',
            count: 10,
        });
    });
});

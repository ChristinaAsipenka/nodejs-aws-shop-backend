const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { handler } = require('../product-service/catalog-batch-process');

jest.mock('@aws-sdk/lib-dynamodb', () => {
    return {
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn(),
            }),
        },
        PutCommand: jest.fn(),
    };
});

jest.mock('@aws-sdk/client-sns', () => {
    return {
        SNSClient: jest.fn().mockReturnValue({
            send: jest.fn(),
        }),
        PublishCommand: jest.fn(),
    };
});

describe('Lambda function tests', () => {
    let ddbDocClientMock;
    let snsClientMock;

    beforeEach(() => {
        jest.clearAllMocks();
        ddbDocClientMock = DynamoDBDocumentClient.from().send;
        snsClientMock = new SNSClient().send;
    });

    it('should create a product and send an SNS message', async () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        title: 'Test Product',
                        description: 'This is a test product',
                        price: 100,
                        count: 10,
                    }),
                },
            ],
        };

        const context = {};
        const callback = jest.fn();

        ddbDocClientMock.mockResolvedValue({});
        snsClientMock.mockResolvedValue({ MessageId: 'test-message-id' });

        console.log = jest.fn();
        console.error = jest.fn();

        await handler(event, context, callback);

        expect(callback).not.toHaveBeenCalledWith(expect.any(Error));
        expect(console.log).toHaveBeenCalledWith('Product created and message sent to SNS:', {
            id: expect.any(String),
            count: 10,
            price: 100,
            title: 'Test Product',
            description: 'This is a test product',
        });
    });

    it('should log an error for missing required fields', async () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        title: '',
                        description: '',
                        price: 0,
                        count: -1,
                    }),
                },
            ],
        };

        const context = {};
        const callback = jest.fn();

        console.error = jest.fn();

        await handler(event, context, callback);

        expect(console.error).toHaveBeenCalledWith('Missing or invalid required fields');
    });
});

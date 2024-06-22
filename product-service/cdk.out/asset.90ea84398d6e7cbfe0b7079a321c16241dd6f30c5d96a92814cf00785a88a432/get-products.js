import data from './products';
export async function handler(event) {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": '*',
            "Access-Control-Allow-Origin": '*',
            "Content-Type": "application/json"
        },
        body: JSON.stringify({data}),
    };
}
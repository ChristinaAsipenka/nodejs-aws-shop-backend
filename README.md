* Task 4.1:  two database tables in DynamoDB are created, script to fill tables with test examples is written
* Task 4.2: AWS CDK Stack is extended with data from database table and pass it to lambda’s environment variables section.
The getProductsList lambda to return via GET /products request a list of products from the database (joined stocks and products tables) is integrated.
Product model on FE side as a joined model of product and stock by productId.
* Lambda function createProduct under the Product Service is created which will be triggered by the HTTP POST method.
The requested URL is /products.
This logic creates a new item in a Products table. [Link to test](https://1pcdcu2oob.execute-api.eu-west-1.amazonaws.com/prod/products)
* Frontend application is integrated with Product Service [(/products API)](https://d14t0or6u1vg0a.cloudfront.net/) and products from Product Service are represented on Frontend.

* Swagger documentation is updated for Product Service.

100/100
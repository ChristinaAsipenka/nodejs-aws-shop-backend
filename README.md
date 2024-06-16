* Product Service contains configuration for 2 lambda functions
* The getProductsList OR getProductsById lambda function returns a correct response (POINT1)
* The [getProductsById](https://1pcdcu2oob.execute-api.eu-west-1.amazonaws.com/prod/product/1) AND [getProductsList](https://1pcdcu2oob.execute-api.eu-west-1.amazonaws.com/prod/products) lambda functions return a correct response code (POINT2)
* Your own Frontend application is integrated with Product Service (/products API) and products from Product Service are represented on Frontend. AND POINT1 and POINT2 are done.

* 7.5 Swagger documentation is created for Product Service. This can be, for example, openapi.(json|yaml) added to the repository, that can be rendered by https://editor.swagger.io/
* 7.5 Lambda handlers are covered by basic UNIT tests (NO infrastructure logic is needed to be covered)
* 7.5 Lambda handlers (getProductsList, getProductsById) code is written not in 1 single module (file) and separated in codebase.
* 7.5 Main error scenarios are handled by API ("Product not found" error).

100/100
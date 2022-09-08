# cdk-golang-newrelic-test

Model stack for testing New Relic monitoring; stack built on article https://faun.pub/golang-build-and-deploy-an-aws-lambda-using-cdk-b484fe99304b.

## Lambda
The GO Lambda function is a simple API using `go-chi/chi` to handle http requests.  
The code is located in the [`/lambda/api`](/lambda/api) folder.

## Deployment with CDK
The CDK stack is also simple, it build the binary of the lambda and deploy it with an API Gateway in front of this lambda to access it through HTTP.  
The code is located in the [`/infra-cdk`](/infra-cdk) folder.

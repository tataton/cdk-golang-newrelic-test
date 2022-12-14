import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';

export class GoLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Build the code and create the lambda
    const lambdaFunction = this.buildAndInstallGOLambda('backend-api', path.join(__dirname, '../../lambda/api'), 'main');

    // Create Rest API Gateway in front of the lambda
    const apiGtw = this.createApiGatewayForLambda("backend-api-endpoint", lambdaFunction, 'Exposed endpoint for your GO lambda API')

    // Output the DNS of your API gateway deployment
    new CfnOutput(this, 'lambda-url', { value: apiGtw.url! });
  }

  /**
   * buildAndInstallGOLambda build the code and create the lambda
   * @param id - CDK id for this lambda
   * @param lambdaPath - Location of the code
   * @param handler - name of the handler to call for this lambda
   */
  buildAndInstallGOLambda(id: string, lambdaPath: string, handler: string): lambda.Function {
    const environment = {
      CGO_ENABLED: '0',
      GOOS: 'linux',
      GOARCH: 'amd64',
    };
    return new lambda.Function(this, id, {
      code: lambda.Code.fromAsset(lambdaPath, {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingImage,
          user: "root",
          environment,
          command: [
            'bash', '-c', [
              'make vendor',
              'make lambda-build',
            ].join(' && ')
          ]
        },
      }),
      handler,
      runtime: lambda.Runtime.GO_1_X,
    });
  }

  /**
   * createApiGatewayForLambda is creating a Rest API Gateway to access to your lambda function
   * @param id - CDK id for this lambda
   * @param handler - Lambda function to call
   * @param description - Description of this endpoint
   */
  createApiGatewayForLambda(id: string, handler: lambda.Function, description: string): LambdaRestApi {
    return new LambdaRestApi(this, id, {
      handler,
      description
    });
  }
}

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class TrainingAppApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM
    const iamPolicyForLambda = new iam.Policy(this, "iamPolicyForLambda", {
      policyName: "TrainingLambdaRolePolicy",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["logs:*"],
          resources: ["arn:aws:logs:*:*:*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["dynamodb:*"],
          resources: ["*"],
        }),
      ],
    });

    const iamRoleForLambda = new iam.Role(this, "iamRoleForLambda", {
      roleName: "TrainingLambdaRole",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    iamPolicyForLambda.attachToRole(iamRoleForLambda);

    // DynamoDB
    const dynamoDbTableUsers = new dynamodb.Table(this, "dynamoDbTableUsers", {
      tableName: "Users",
      partitionKey: {
        name: "UserId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    // Lambda TrainingGetUsers
    const lambdaTrainingGetUsersFilePath = "lambda/TrainingGetUsers/index.mjs";
    const lambdaTrainingGetUsers = new NodejsFunction(
      this,
      "lambdaTrainingGetUsers",
      {
        functionName: "TrainingGetUsers",
        entry: lambdaTrainingGetUsersFilePath,
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        role: iamRoleForLambda,
        memorySize: 128,
      }
    );

    // Lambda TrainingPostUser
    const lambdaTrainingPostUserFilePath = "lambda/TrainingPostUser/index.mjs";
    const lambdaTrainingPostUser = new NodejsFunction(
      this,
      "lambdaTrainingPostUser",
      {
        functionName: "TrainingPostUser",
        entry: lambdaTrainingPostUserFilePath,
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        role: iamRoleForLambda,
        memorySize: 128,
      }
    );

    // Lambda TrainingPutUser
    const lambdaTrainingPutUserFilePath = "lambda/TrainingPutUser/index.mjs";
    const lambdaTrainingPutUser = new NodejsFunction(
      this,
      "lambdaTrainingPutUser",
      {
        functionName: "TrainingPutUser",
        entry: lambdaTrainingPutUserFilePath,
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        role: iamRoleForLambda,
        memorySize: 128,
      }
    );

    // Lambda TrainingDeleteUser
    const lambdaTrainingDeleteUserFilePath =
      "lambda/TrainingDeleteUser/index.mjs";
    const lambdaTrainingDeleteUser = new NodejsFunction(
      this,
      "lambdaTrainingDeleteUser",
      {
        functionName: "TrainingDeleteUser",
        entry: lambdaTrainingDeleteUserFilePath,
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        role: iamRoleForLambda,
        memorySize: 128,
      }
    );

    // Lambda TrainingAuth
    const lambdaTrainingAuthFilePath = "lambda/TrainingAuth/index.mjs";
    const lambdaTrainingAuth = new NodejsFunction(this, "lambdaTrainingAuth", {
      functionName: "TrainingAuth",
      entry: lambdaTrainingAuthFilePath,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      role: iamRoleForLambda,
      memorySize: 128,
    });

    // API Gateway
    const trainingApi = new apigateway.RestApi(this, "trainingApi", {
      restApiName: "TrainingApi",
      deployOptions: {
        stageName: "v1",
      },
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });

    // オーソライザー
    const trainingApiAuthorizer = new apigateway.TokenAuthorizer(
      this,
      "trainingApiAuthorizer",
      {
        authorizerName: "trainingApiAuthorizer",
        handler: lambdaTrainingAuth,
        identitySource: "method.request.header.authorizationToken",
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    // API Gateway - API KEY
    const trainingApiKey = trainingApi.addApiKey("trainingApiKey", {
      apiKeyName: "TrainingApiKey",

    });

    // API Gateway - 使用量プラン
    const trainingApiUsagePlan = trainingApi.addUsagePlan(
      "trainingApiUsagePlan",
      {
        name: "TrainingApiUsagePlan",
        throttle: {
          rateLimit: 5,
          burstLimit: 2,
        },
        quota: {
          limit: 10,
          period: apigateway.Period.DAY,
        },
      }
    );
    trainingApiUsagePlan.addApiKey(trainingApiKey);
    trainingApiUsagePlan.addApiStage({ stage: trainingApi.deploymentStage });

    const trainingApiUsers = trainingApi.root.addResource("users");
    trainingApiUsers.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaTrainingGetUsers),
      {
        authorizer: trainingApiAuthorizer,
      }
    );
    trainingApiUsers.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaTrainingPostUser),
      {
        authorizer: trainingApiAuthorizer,
      }
    );

    const trainingApiUsersUserId = trainingApiUsers.addResource("{UserId}");
    trainingApiUsersUserId.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(lambdaTrainingPutUser),
      {
        authorizer: trainingApiAuthorizer,
      }
    );
    trainingApiUsersUserId.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(lambdaTrainingDeleteUser),
      {
        authorizer: trainingApiAuthorizer,
      }
    );
  }
}

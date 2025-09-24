import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event) => {
  const pathParameters = event.pathParameters;
  const body = JSON.parse(event.body);
  const client = new DynamoDBClient({ region: "ap-northeast-1" });

  // データ更新
  const updateParams = {
    TableName: "Users",
    Key: {
      UserId: pathParameters.UserId,
    },
    UpdateExpression: "set UserName = :UserName, Age = :Age",
    ExpressionAttributeValues: {
      ":UserName": body.UserName,
      ":Age": body.Age,
    },
    ReturnValues: "ALL_NEW",
  };
  const updateCommand = new UpdateCommand(updateParams);
  const updateResult = await client.send(updateCommand);

  const response = {
    statusCode: 200,
    body: JSON.stringify(updateResult.Attributes),
  };
  return response;
};

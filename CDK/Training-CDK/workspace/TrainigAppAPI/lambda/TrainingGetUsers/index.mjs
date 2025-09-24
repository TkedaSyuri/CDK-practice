import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event) => {
  const client = new DynamoDBClient({ region: "ap-northeast-1" });

  const params = {
    TableName: "Users",
  };
  const command = new ScanCommand(params);
  const data = await client.send(command);

  const response = {
    statusCode: 200,
    body: JSON.stringify(data.Items),
  };
  return response;
};

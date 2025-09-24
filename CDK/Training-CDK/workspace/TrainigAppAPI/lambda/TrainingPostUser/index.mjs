import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const client = new DynamoDBClient({ region: "ap-northeast-1" });

  // 発番するUserIdを算出
  const scanParams = {
    TableName: "Users",
  };
  const scanCommand = new ScanCommand(scanParams);
  const scanResult = await client.send(scanCommand);
  const newUserId = getNewUserId(scanResult);

  // データ登録
  const updateParams = {
    TableName: "Users",
    Key: {
      UserId: `${newUserId}`,
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

const getNewUserId = (scanResult) => {
  let newUserId = 1;
  if (scanResult.Count === 0) {
    return newUserId;
  }
  for (const item of scanResult.Items) {
    if (newUserId < item.UserId) {
      newUserId = item.UserId;
    }
  }
  return Number(newUserId) + 1;
};

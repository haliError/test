require("dotenv").config();
const DynamoDB = require("@aws-sdk/client-dynamodb");
const DynamoDBLib = require("@aws-sdk/lib-dynamodb");

const qutUsername = "n11543701@qut.edu.au";
const tableName = "image_transfer_test";
const sortKey = "id";
const shortid = require("shortid");

const image = {
   id: shortid.generate(),
   title: "test-title",
   filename: "test-filename",
   filepath: "/uploads/test-filename",
   mimetype: "test-mimetype",
   size: 1024,
};

async function main() {
   const client = new DynamoDB.DynamoDBClient({ region: "ap-southeast-2" });
   const docClient = DynamoDBLib.DynamoDBDocumentClient.from(client);

   // Create a new table
   const createTableCommand = new DynamoDB.CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
         { AttributeName: "id", AttributeType: "S" },
         { AttributeName: "title", AttributeType: "S" },
         { AttributeName: "filename", AttributeType: "S" },
         { AttributeName: "filepath", AttributeType: "S" },
         { AttributeName: "mimetype", AttributeType: "S" },
         { AttributeName: "size", AttributeType: "N" },
      ],
      KeySchema: [
         { AttributeName: "id", KeyType: "HASH" },
         { AttributeName: "title", KeyType: "RANGE" }
      ],
      ProvisionedThroughput: {
         ReadCapacityUnits: 1,
         WriteCapacityUnits: 1,
      },
   });

   // Send the command to create the table
   try {
      const response = await client.send(createTableCommand);
      console.log("Create Table command response:", response);
   } catch (err) {
      console.log(err);
   }

   // Put an object
   const putCommand = new DynamoDBLib.PutCommand({
      TableName: tableName,
      Item: image
   });

   // Send the command to put an item
   try {
      const response = await docClient.send(putCommand);
      console.log("Put command response:", response);
   } catch (err) {
      console.log(err);
   }

   // Get an object
   const getCommand = new DynamoDBLib.GetCommand({
      TableName: tableName,
      Key: {
         "id": image.id,
         "title": image.title,
      },
   });

   // Send the command to get an item
   try {
      const response = await docClient.send(getCommand);
      console.log("Item data:", response.Item);
   } catch (err) {
      console.log(err);
   }

   // Query
   const queryCommand = new DynamoDBLib.QueryCommand({
      TableName: tableName,
      KeyConditionExpression:
         "#partitionKey = :username AND begins_with(#sortKey, :nameStart)",
      ExpressionAttributeNames: {  
         "#partitionKey": "id",
         "#sortKey": "title",
      },
      ExpressionAttributeValues: {
         ":username": image.id,
         ":nameStart": "test",
      },
   });

   // Send the command to run a query
   try {
      const response = await docClient.send(queryCommand);
      console.log("Query found these items: ", response.Items);
   } catch (err) {
      console.log(err);
   }
}

main();
import {
  DynamoDBClient,
  QueryCommandInput,
  paginateQuery,
  DynamoDBPaginationConfiguration,
  QueryCommand,
  QueryCommandOutput
} from "@aws-sdk/client-dynamodb";
import config from "./config.js";

const client = new DynamoDBClient({ region: config.dynamoRegion });

import { IBook } from "./IBook";

async function listAllItemsViaAsyncIterator(
  published_date:string
) {
  const input: QueryCommandInput = {
    TableName: config.TableName,
    IndexName: "category-key-index",
    KeyConditionExpression: "#category = :category and begins_with(#published_date, :published_date)",
    ExpressionAttributeNames: {
      "#category": "category",
      "#published_date": "published_date",
    },
    ExpressionAttributeValues: {
      ":published_date": { S: published_date },
      ":category": { S: "fiction" },
    },
    Limit:1000
  };

  let paginateConfig: DynamoDBPaginationConfiguration = {client};
  let cursor = paginateQuery(paginateConfig, input);
  let allRecords= []
  for await (let c of cursor){
    allRecords.push(...c.Items!)
   
  }
  console.log("[I] Total Records: ", allRecords.length, allRecords[0])
  //it will get all records

}


async function listAllItemsViaSingleFetch(
    published_date:string
  ) {
    const input: QueryCommandInput = {
      TableName: config.TableName,
      IndexName: "category-key-index",
      KeyConditionExpression: "#category = :category and begins_with(#published_date, :key)",
      ExpressionAttributeNames: {
        "#category": "category",
        "#published_date": "published_date",
      },
      ExpressionAttributeValues: {
        ":published_date": { S: published_date },
        ":category": { S: "fiction" },
      },
      Limit:1000
    };
  
    const command = new QueryCommand(input);
    const data:QueryCommandOutput = await client.send(command);
    console.log( "[I] Total Items via single Fetch:", data.Count)
    //this will only get max of 1000 records.
  
  }

await listAllItemsViaAsyncIterator("2022-07-");
await listAllItemsViaSingleFetch("2022-07-");
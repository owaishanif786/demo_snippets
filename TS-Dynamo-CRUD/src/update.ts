import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput  } from "@aws-sdk/client-dynamodb";
import { IBook } from "./IBook.js";
import config  from './config.js';


const client = new DynamoDBClient({ region: config.dynamoRegion });


//if default key compound then you have to provide both partition and sort key
async function updateBook(book:IBook, ):Promise<IBook | null> {
    let input:UpdateItemCommandInput = {
        TableName: config.TableName,
        Key: { ISBN: {S:book.ISBN}, published_date: {S:book.published_date} },
        UpdateExpression: "set #author= :author, #title= :title, #category= :category",
        ExpressionAttributeNames: {
          "#author": "author",
          "#title": "title",
          "#category": "category"
        },
        ExpressionAttributeValues: {
          ":author": {S:book.author},
          ":title": {S:book.title},
          ":category": {S:book.category}
        },
        ReturnValues: "ALL_NEW",

    }
    const command = new UpdateItemCommand(input);
    try {
        const response:UpdateItemCommandOutput = await client.send(command);
        // console.log("[I] updatedResponse: ", JSON.stringify(response))
        if(response.$metadata.httpStatusCode === 200 && response.Attributes){
            return {
                ISBN: response.Attributes.ISBN.S!,
                published_date: response.Attributes.published_date.S!,
                category: response.Attributes.category.S!,
                author: response.Attributes.author.S!,
                title: response.Attributes.title.S!

            };

        }
        
    } catch (error) {
        console.log("[E]", error);
    }

    return null;


}

async function run():Promise<void>{
    let book:IBook= {
        ISBN: '333333333',
        published_date: "2022-07-10T20:21:54.094Z",
        author:'janee',
        category: 'earthh',
        title: 'everyhing greenn'
    }
    const updatedBook: IBook | null=await updateBook(book);
    console.log("[I] updatedBook: ",updatedBook);
/*
[I] updatedResponse:  {"$metadata":{"httpStatusCode":200,"requestId":"ICTFHT60V5GOJOGBO1UOKNLF73VV4KQNSO5AEMVJF66Q9ASUAAJG","attempts":1,"totalRetryDelay":0},"Attributes":{"category":{"S":"earthh"},"published_date":{"S":"2022-07-10T20:21:54.094Z"},"ISBN":{"S":"333333333"},"author":{"S":"janee"},"title":{"S":"everyhing greenn"}}}
[I] updatedBook:  {
ISBN: '333333333',
published_date: '2022-07-10T20:21:54.094Z',
category: 'earthh',
author: 'janee',
title: 'everyhing greenn'
*/
}

run();
import { DynamoDBClient, DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput  } from "@aws-sdk/client-dynamodb";
import { IBook } from "./IBook.js";
import config  from './config.js';

const client = new DynamoDBClient({ region: config.dynamoRegion });

async function deleteBook(book:IBook):Promise<boolean>{
    let input:DeleteItemCommandInput = {
        TableName: config.TableName,
        Key: {ISBN:{S:book.ISBN}, published_date: {S:book.published_date}},
        ReturnValues: "ALL_OLD"

    }
    const command = new DeleteItemCommand(input);
    try {
        const response:DeleteItemCommandOutput = await client.send(command);
        console.log("[I] deleteItemResponse: ", response)
        //even record is not deleted response.$metadata.httpStatusCode still returns 200. so we have to check Attributes
        if(response.Attributes && response.Attributes.ISBN.S){
            return true;
        }
    } catch (error) {
        console.log("[E]", error);
    }

    return false;


}

async function run(){
    let bookDeleted = await deleteBook({ISBN: "299999999", published_date: '2022-08-08T08:41:01.117Z', author: "miller", category: "fiction",title: "zombies" })
    console.log("[I] book deleted: ", bookDeleted)
}

run();
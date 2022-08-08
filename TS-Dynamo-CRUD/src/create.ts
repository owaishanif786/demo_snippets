import { DynamoDBClient, PutItemCommand, PutItemCommandInput, PutItemCommandOutput  } from "@aws-sdk/client-dynamodb";
import { IBook } from "./IBook.js";
import config  from './config.js';


const client = new DynamoDBClient({ region: config.dynamoRegion });



async function createBook(book:IBook):Promise<boolean>{
    let input:PutItemCommandInput = {
        TableName: config.TableName,
        Item: {
            ISBN: {S: book.ISBN},
            published_date : {S: book.published_date},
            author: {S: book.author},
            category: {S: book.category},
            title: {S: book.title}

        },
        
        ReturnValues: "ALL_OLD"

    }
    const command = new PutItemCommand(input);
    try {
        const response:PutItemCommandOutput = await client.send(command);
        // console.log("[I] putItemResponse: ", response.$metadata.httpStatusCode)
        if(response.$metadata.httpStatusCode){
            return true;
        }
    } catch (error) {
        console.log("[E]", error);
    }

    return false;


}

async function run(){
    let bookCreated = await createBook({ISBN: "299999999", published_date: new Date().toISOString(), author: "miller", category: "fiction",title: "zombies" })
    console.log("[I] book created: ", bookCreated)
}

run();
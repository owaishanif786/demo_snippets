import { DynamoDBClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import config  from './config.js';

const client = new DynamoDBClient({ region: config.dynamoRegion });


interface IBook {
    ISBN: string;
    published_date: string;
    author:string;
    category:string;
    title:string;
}


//Querying on default Partition key and sort key. 
//Notice we are not using any parameter IndexName because we are querying on default partition key/index.
//When querying default index we have to provide partition key and if sort key is included like in this case then we must also provide sort key
//Notice ISBN is unique and published_date as sort key does not make any sense. so when we are choosing partition key as totally unique then there is no need to pick sort key.
async function getBook(ISBN:string, published_date:string ):Promise<IBook | null> {
    try {
        const input:QueryCommandInput = {
            TableName: config.TableName, 
            KeyConditionExpression: "#ISBN = :ISBN and #published_date = :published_date",
            ExpressionAttributeNames: {
                "#ISBN": "ISBN",
                "#published_date": "published_date",
              },
              ExpressionAttributeValues: {
                ":ISBN": { S: ISBN },
                ":published_date": { S: published_date },
              },
              Select:"ALL_ATTRIBUTES"
           };
        const command = new QueryCommand(input);
        const data:QueryCommandOutput = await client.send(command);
        if(data.Items?.length && data.Items[0]){
            let book = data.Items[0];
            // console.log(book)

        
            return {
                ISBN: book.ISBN.S!,
                published_date: book.published_date.S!,
                author:book.author.S!,
                category:book.category.S!,
                title:book.title.S!
            }  
        }
      } catch (error) {
        console.log('[E] Error', error)
       
        // return error;
        // error handling.
      } 
      return null;
      

}


//We are querying on GSI category as partition key and published_date as sort key
//Notice function call in run ["earth", "2022-07"] where we are asking select * from books where category = earth and published_date begins_with "2022-07"
//If we have lot more record then we can also use FilterExpress that can further narrow down. with FilterExpression we can use almost all operators we can use with sort key. like begins_with <>= etc.
async function listBook(category:string, published_date:string ):Promise<IBook[] | null> {
    try {
        const input:QueryCommandInput = {
            TableName: config.TableName, 
            IndexName: "category-published_date-index",
            KeyConditionExpression: "#category = :category and begins_with(#published_date, :published_date) ",
            ExpressionAttributeNames: {
                "#category": "category",
                "#published_date": "published_date",
              },
              ExpressionAttributeValues: {
                ":category": { S: category },
                ":published_date": { S: published_date },
              },
              Select:"ALL_ATTRIBUTES"
           };
        const command = new QueryCommand(input);
        const data:QueryCommandOutput = await client.send(command);
        if(data.Items?.length && data.Items[0]){
            let books = data.Items;
            // console.log(book)

            return books.map(book => ({
                ISBN: book.ISBN.S!,
                published_date: book.published_date.S!,
                author:book.author.S!,
                category:book.category.S!,
                title:book.title.S!
            }  ))
        
           
        }
      } catch (error) {
        console.log('[E] Error', error)
       
        // return error;
        // error handling.
      } 
      return null;
      

}




async function run():Promise<void>{
    const book:IBook | null = await getBook("111111111", "2022-08-07T20:20:10.528Z");
    console.log('[I] book:', book);

    const bookList:IBook[] | null = await listBook("earth", "2022-07");
    console.log('[I] bookList: ', bookList)

}

run();


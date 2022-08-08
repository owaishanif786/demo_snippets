
interface IConfig {
    dynamoRegion: string;
    TableName: string;
}

const config:IConfig = {
    dynamoRegion:'us-east-1',
    TableName: 'books'
}


export default config;
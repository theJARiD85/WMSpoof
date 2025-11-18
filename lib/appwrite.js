import { Client, Account, Databases, Storage, Messaging } from 'react-native-appwrite';

const accountClient = new Client();

accountClient
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('67230a63003cde400378'); // Your project ID

export const account = new Account(accountClient);

const databaseClient = new Client();

databaseClient
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('67230a63003cde400378'); // Your project ID

export const databases = new Databases(databaseClient);

const storageClient = new Client();

storageClient
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('67230a63003cde400378'); // Your project ID
  
export const storage = new Storage(storageClient);

const messagingClient = new Client();

messagingClient
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite endpoint
  .setProject('67230a63003cde400378'); // Your project ID
  
export const messages = new Messaging(messagingClient);
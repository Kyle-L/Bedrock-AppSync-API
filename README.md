![Bedrock AppSync API](docs/header.png)

# Table of Content <!-- omit in toc -->
- [Overview](#overview)
- [Architecture](#architecture)
  - [Terminology](#terminology)
  - [Infrastructure Services Used](#infrastructure-services-used)
  - [The Event Flow](#the-event-flow)


# Overview
This repository contains the AWS CDK Infrastructure-as-code for an Chatbot that is powered an AWS AppSync web socket API to provide real-time chat functionality backed by AWS Bedrock. It is designed with serverless in mind and uses a variety of AWS services to provide a scalable and Gen AI application.

A simple [Vite](https://vitejs.dev/) and [TypeScript](https://www.typescriptlang.org/) based frontend is provided to demonstrate the functionality of the API.


# Architecture
![Diagram](./docs/diagram.svg)

## Terminology
- **Thread**: A thread is a conversation between a user and the chatbot. It is identified by a unique `threadId` and contains a list of `messages`.
- **Message**: A message is a single message in a thread. It is identified by a unique `messageId` and contains the `content` of the message, the `sender` of the message, and the `timestamp` of the message.

## Infrastructure Services Used

**Frontend**:
| Service                   | Description                                                                                                      |
|---------------------------|------------------------------------------------------------------------------------------------------------------|
| [CloudFront](https://aws.amazon.com/cloudfront/)  | Acts as a CDN for the static files of the frontend and serves them from the S3 bucket.                           |
| [S3](https://aws.amazon.com/s3/)                   | Stores the static files of the frontend.                                                                         |

**Backend**:

| Service                   | Description                                                                                                      |
|---------------------------|------------------------------------------------------------------------------------------------------------------|
| [AppSync](https://aws.amazon.com/appsync/)         | Provides a GraphQL API to the frontend, using both `mutations` and `queries`, as well as `subscriptions` for real-time chat messages. |
| [Bedrock](https://aws.amazon.com/bedrock/)         | AWS Bedrock is used to provide the AI capabilities of the chatbot.                                                |
| [DynamoDB](https://aws.amazon.com/dynamodb/)       | Used to store the threads, messages, and the status of the Gen AI processing.                                     |
| [SQS](https://aws.amazon.com/sqs/)                 | Acts as a queue for the messages that are sent to the Bedrock invocation lambda.                                  |
| [Lambda](https://aws.amazon.com/lambda/)           | Handles the invocation of AWS Bedrock and pre-processes the message before sending it to SQS.                     |
| [Cognito](https://aws.amazon.com/cognito/)         | Handles the authentication of the users and authorizes them to use the AppSync API.                                |

## The Event Flow

1. A user sends a message to the AppSync API.
2. If provided a threadId, an AppSync resolver will retrieve the thread from DynamoDB.
3. The Queue trigger lambda will be invoked with the conversation history, the users new prompt, and the threadId.
4. The Queue trigger lambda will check the status of the thread in DynamoDB to see if it is currently being processed and only continue if it is not.
5. The Queue trigger lambda will send the message to SQS after additional validation checks and update the status of the thread in DynamoDB to `PROCESSING`.
6. The Bedrock invocation lambda will be invoked by SQS and will send the message to AWS Bedrock for processing.
7. As the Bedrock invocation lambda recieves chunks, it will store completed result and send back the chunks to the user via an AppSync subscription.
8. Once, the Bedrock invocation lambda has recieved all the chunks, it will update the status of the thread in DynamoDB to `PROCESSED`, store the result, and send the status update to the user via an AppSync subscription to indicate that the last chunk has been sent.
9. The user will recieve the result of the Gen AI processing via an AppSync subscription.
10. The user can then send another message to the AppSync API.
11. The process repeats.
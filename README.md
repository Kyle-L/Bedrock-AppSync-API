![Bedrock AppSync API](docs/header.png)

![TypeScript](https://img.shields.io/badge/Developmental-F47521.svg?style=for-the-badge&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Dependabot](https://img.shields.io/badge/dependabot-025E8C?style=for-the-badge&logo=dependabot&logoColor=white)

# Table of Content <!-- omit in toc -->
- [Overview](#overview)
- [Architecture](#architecture)
  - [Terminology](#terminology)
  - [Infrastructure Services Used](#infrastructure-services-used)
  - [The Event Flow](#the-event-flow)
- [Zero to Hero](#zero-to-hero)
  - [Setup](#setup)
  - [Pinecone Setup (Optional)](#pinecone-setup-optional)
  - [Azure AI Services Speech Service Setup (Optional)](#azure-ai-services-speech-service-setup-optional)
  - [Backend](#backend)
  - [Frontend](#frontend)


# Overview
This repository contains the AWS CDK Infrastructure-as-code for an AWS AppSync web socket API to provide real-time functionality backed by AWS Bedrock. It is designed with serverless in mind and uses a variety of AWS services to provide a scalable Gen AI API.

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

# Zero to Hero
> This section guides you through the process of deploying the infrastructure.

## Setup

1. Pre-requisites:
  - [Node.js](https://nodejs.org/en/) version 14 or later.
  - [AWS CLI](https://aws.amazon.com/cli/) version 2 or later.
  - [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) version 2 or later.
  - [Pinecone](https://www.pinecone.io/) account (optional).

2. Clone the repository and navigate to the infrastructure directory.
```bash
git@github.com:Kyle-L/Bedrock-AppSync-API.git 
cd Bedrock-AppSync-API/infrastructure
```

3. Install the dependencies.
```bash
npm install
```

4. Install AWS CDK
```bash
npm install -g aws-cdk
```

## Pinecone Setup (Optional)
> If you are not familiar with Pinecone, Pinecone is a vector database that allows you to store and query high-dimensional vectors. It is used in this project to store the embeddings of the messages and to query for similar messages.
> For this project, we are using it as the vector database that backs a [Bedrock Knowledge Base](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html) to allow our chatbot to provide relevant responses to the user based on data from an S3 bucket.

1. Create a Pinecone account at [https://www.pinecone.io/](https://www.pinecone.io/).

2. Create a new Pinecone index.
  - There are additional configurations that you must provide when creating a Pinecone index:
    - Name – The name of the vector index. Choose any valid name of your choice. Later, when you create your knowledge base, enter the name you choose in the Vector index name field.
    - Dimensions – The number of dimensions in the vector. Choose `1536`. This is what the Knowledge Base uses.
    - Distance metric – The metric used to measure the similarity between vectors. While the Knowledge Base supports multiple distance metrics, choose `cosine` for this example. You can experiment with other distance metrics later.

3. Get the Pinecone API key and the Pinecone index name.
  - You can find the API key and the index name in the Pinecone console.

4. Create a new AWS Secrets Manager secret for PineCone. Save the ARN of the secret for later.
```sh 
aws secretsmanager create-secret --name <MY_SECRET_NAME> --secret-string '{"apiKey":"<MY_API_KEY>"}'
```

## Azure AI Services Speech Service Setup (Optional)
> If you are not familiar with Azure Cognitive Services, Azure Cognitive Services is a collection of APIs that allow you to add AI capabilities to your applications. We are using it for its text-to-speech capabilities to allow our chatbot to speak to the user. AWS Polly was not used due to its limited support for custom voices.

1. Create an Azure account at [https://azure.microsoft.com/en-us/](https://azure.microsoft.com/en-us/).

2. Create a new Azure Speech resource.
  - There are additional configurations that you must provide when creating an Azure Speech resource:
    - Name – The name of the resource. Choose any valid name of your choice.
    - Subscription – The subscription to use for the resource. Choose the subscription you want to use.
    - Resource group – The resource group to use for the resource. Choose the resource group you want to use.
    - Location – The location to use for the resource. Choose the location you want to use.
    - Pricing tier – The pricing tier to use for the resource. Choose the pricing tier you want to use. For this example, choose the `F0` pricing tier to use the free tier.
    - Azure Speech resource name – The name of the Azure Speech resource. Choose any valid name of your choice.

3. Get the Azure Speech resource key and the Azure Speech region.
  - You can find the resource key and the region in the Azure Speech resource console under "Overview".

4. Create a new AWS Secrets Manager secret for Azure. Save the ARN of the secret for later.
```sh 
aws secretsmanager create-secret --name <MY_SECRET_NAME> --secret-string '{"region":"<MY_REGION>","key":"<MY_SUBSCRIPTION_KEY>"}'
```


## Backend
![Work-in-Progress](docs/wip.jpg)

## Frontend
![Work-in-Progress](docs/wip.jpg)

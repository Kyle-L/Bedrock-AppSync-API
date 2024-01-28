import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@aws-sdk/protocol-http';
import * as https from 'https';

export interface RequestParams {
  config: {
    url: string;
    key?: string;
    region: string;
  };
  operation: {
    query: string;
    operationName: string;
    variables: object;
  };
}

export interface GraphQLResult<T = object> {
  data?: T;
  errors?: any[];
  extensions?: { [key: string]: any };
}

export const AppSyncRequestIAM = async (params: RequestParams) => {
  const endpoint = new URL(params.config.url);
  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: params.config.region,
    service: 'appsync',
    sha256: Sha256
  });

  const requestToBeSigned = new HttpRequest({
    hostname: endpoint.host,
    port: 443,
    path: endpoint.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host
    },
    body: JSON.stringify(params.operation)
  });

  const signedRequest = await signer.sign(requestToBeSigned);

  return new Promise((resolve, _reject) => {
    const httpRequest = https.request(
      { ...signedRequest, host: endpoint.hostname },
      (result) => {
        result.on('data', (data) => {
          resolve(JSON.parse(data.toString()));
        });
      }
    );
    httpRequest.write(signedRequest.body);
    httpRequest.end();
  });
};

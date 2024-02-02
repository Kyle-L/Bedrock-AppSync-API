import { App } from 'aws-cdk-lib';
import { ApplicationStage } from './lib/stages/application-stage';
import { config } from './config';

const app = new App();

new ApplicationStage(app, 'GenAI', config);

app.synth();

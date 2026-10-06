#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TelagriStaticSiteStack } from '../lib/telagri-static-site-stack';
import { TelagriApiStack } from '../lib/telagri-api-stack';

const app = new cdk.App();

const env = { account: '183784642322', region: 'us-east-1' };

new TelagriStaticSiteStack(app, 'gov-prod-demo', { env });

new TelagriApiStack(app, 'telagri-api', {
  env,
  sendgridApiKeyParam: '/telagri/demo/sendgrid-api-key',
  fromEmail: 'no-reply@telagri.com',
  toEmails: 'Diana@telagri.com,valeri@telagri.com',
  allowedOrigin: 'https://demo.telagri.com',
});



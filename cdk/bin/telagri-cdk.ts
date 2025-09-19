#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TelagriStaticSiteStack } from '../lib/telagri-static-site-stack';

const app = new cdk.App();

new TelagriStaticSiteStack(app, 'gov-prod-demo', {
  env: { account: '183784642322', region: 'us-east-1' },
});



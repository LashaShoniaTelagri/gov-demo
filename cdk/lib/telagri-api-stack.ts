import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'node:path';

export interface TelagriApiStackProps extends cdk.StackProps {
  /**
   * SSM Parameter Store name (SecureString) that holds the SendGrid API key.
   * Provisioned manually — not managed by CDK.
   */
  sendgridApiKeyParam: string;
  /** Verified SendGrid sender address. */
  fromEmail: string;
  /** Comma-separated list of recipient emails. */
  toEmails: string;
  /** CORS allowed origin for the API (site URL). */
  allowedOrigin: string;
}

export class TelagriApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TelagriApiStackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'OrderHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      // __dirname at runtime is cdk/dist/lib/, so two levels up reaches cdk/.
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'order-handler')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
      environment: {
        SENDGRID_API_KEY_PARAM: props.sendgridApiKeyParam,
        FROM_EMAIL: props.fromEmail,
        TO_EMAILS: props.toEmails,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    });

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${
            props.sendgridApiKeyParam.startsWith('/')
              ? props.sendgridApiKeyParam
              : `/${props.sendgridApiKeyParam}`
          }`,
        ],
      }),
    );

    const api = new apigw.RestApi(this, 'OrdersApi', {
      restApiName: 'telagri-orders',
      deployOptions: { stageName: 'prod' },
      defaultCorsPreflightOptions: {
        allowOrigins: [props.allowedOrigin],
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        maxAge: cdk.Duration.minutes(10),
      },
    });

    const orders = api.root.addResource('orders');
    orders.addMethod('POST', new apigw.LambdaIntegration(handler));

    new cdk.CfnOutput(this, 'OrdersApiUrl', { value: api.url });
  }
}

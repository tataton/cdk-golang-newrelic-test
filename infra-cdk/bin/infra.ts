#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GoLambdaStack } from '../lib/go-lambda-stack';

const app = new cdk.App();
new GoLambdaStack(app, 'GoLambdaStack');

import { expect as cdk_expect, haveResource } from '@aws-cdk/assert';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { Stack } from '@aws-cdk/core';
import { Watchful, WatchfulProps } from '../src';

test('creates an empty dashboard by default', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new Watchful(stack, 'watchful');

  // THEN
  cdk_expect(stack).to(haveResource('AWS::CloudWatch::Dashboard'));
});

test('dashboard prop can be used to disable the creation of a dashboard', () => {
  // GIVEN
  const stack = new Stack();
  const props : WatchfulProps = { dashboard: false };

  // WHEN
  new Watchful(stack, 'watchful', props);

  // THEN
  cdk_expect(stack).notTo(haveResource('AWS::CloudWatch::Dashboard'));
});

test('should fail if dashboard name is specified but dashboard is disabled', () => {
  // GIVEN
  const stack = new Stack();
  const props : WatchfulProps = { dashboard: false, dashboardName: 'Test' };

  // WHEN
  const wf = () => {
    new Watchful(stack, 'watchful', props);
  };

  // THEN
  expect(wf).toThrow(Error);
});

test('alarmActions can be used to specify a list of custom alarm actions', () => {
  // GIVEN
  const stack = new Stack();
  const table = new ddb.Table(stack, 'Table', {
    partitionKey: { name: 'ID', type: ddb.AttributeType.STRING },
  });

  // WHEN
  const wf = new Watchful(stack, 'watchful', {
    alarmActionArns: [
      'arn:of:custom:alarm:action',
      'arn:2',
    ],
  });

  wf.watchDynamoTable('MyTable', table);

  // THEN
  cdk_expect(stack).to(haveResource('AWS::CloudWatch::Alarm', {
    AlarmActions: [
      'arn:of:custom:alarm:action',
      'arn:2',
    ],
  }));
});
import { Module } from '@nestjs/common';
import { AwsS3Controller } from './aws-s3.controller';

@Module({ controllers: [AwsS3Controller] })
export class AwsS3Module {}

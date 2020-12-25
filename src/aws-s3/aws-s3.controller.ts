import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Controller('aws-s3')
export class AwsS3Controller {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file,
  ): Promise<{ ok: boolean; error?: string; url?: string }> {
    const maxSize = 1 * 1024 * 1024; // 1mb
    if (maxSize < file.size) {
      return { ok: false, error: 'File size limit is 1 MB.' };
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.mimetype)) {
      return {
        ok: false,
        error: `Only ${validTypes
          .map((type) => type.split('/')[1])
          .join(', ')} files are accepted.`,
      };
    }
    aws.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
    try {
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const objectName = uuidv4().replace(/[-]/g, '') + file.originalname;
      const result = await new aws.S3()
        .upload({
          ACL: 'public-read',
          Body: file.buffer,
          Bucket: bucketName,
          Key: objectName,
        })
        .promise();
      return { ok: true, url: result.Location };
    } catch {
      return { ok: false, error: 'Failed to upload image.' };
    }
  }
}

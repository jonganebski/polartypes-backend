import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AwsS3Service } from './aws-s3.service';
import { DeleteFilesInput } from './dto/delete-images.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('aws-s3')
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      ...(process.env.NODE_ENV !== 'production' && {
        storage: diskStorage({
          destination: process.cwd() + '/src/uploads',
          filename: (_, file, callback) =>
            callback(null, uuidv4().replace(/[-]/g, '') + file.originalname),
        }),
      }),
    }),
  )
  uploadImage(@UploadedFile() uploadedFile) {
    return this.awsS3Service.uploadImage(uploadedFile);
  }

  @Post('delete')
  deleteImage(@Body() deleteFilesInput: DeleteFilesInput) {
    return this.awsS3Service.deleteImage(deleteFilesInput);
  }
}

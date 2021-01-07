import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from './aws-s3.service';
import { DeleteFilesInput } from './dto/delete-images.dto';

@Controller('aws-s3')
export class AwsS3Controller {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() uploadedFile) {
    return this.awsS3Service.uploadImage(uploadedFile);
  }

  @Post('delete')
  deleteImage(@Body() deleteFilesInput: DeleteFilesInput) {
    return this.awsS3Service.deleteImage(deleteFilesInput);
  }
}

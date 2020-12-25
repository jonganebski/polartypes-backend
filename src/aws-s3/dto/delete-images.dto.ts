import { IsArray, IsUrl } from 'class-validator';

export class DeleteFilesInput {
  @IsArray()
  @IsUrl({}, { each: true })
  readonly urls: string[];
}

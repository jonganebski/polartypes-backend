import { IsArray, IsUrl } from 'class-validator';

export class DeleteFilesInput {
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  readonly urls: string[];
}

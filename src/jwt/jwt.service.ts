import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}
  sign(userId: number): string {
    return sign({ userId }, this.configService.get('JWT_PRIVATE_KEY'));
  }
  verify(token: string) {
    return verify(token, this.configService.get('JWT_PRIVATE_KEY'));
  }
}

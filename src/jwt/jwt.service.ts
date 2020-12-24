import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) {}
  sign(userId: number, rememberMe: boolean): string {
    let expiresIn = 1000 * 60 * 60 * 24 * 7; // 1 week
    if (rememberMe) {
      expiresIn = expiresIn * 10; // 10 weeks
    }
    return sign({ userId }, this.configService.get('JWT_PRIVATE_KEY'), {
      expiresIn,
    });
  }
  verify(token: string) {
    return verify(token, this.configService.get('JWT_PRIVATE_KEY'));
  }
}

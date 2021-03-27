import { Inject, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { IJwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: IJwtModuleOptions,
  ) {}

  sign(userId: number, rememberMe: boolean): string {
    let expiresIn = 1000 * 60 * 60 * 24 * 7; // 1 week
    if (rememberMe) {
      expiresIn = expiresIn * 10; // 10 weeks
    }
    return sign({ userId }, this.options.jwtPrivateKey, {
      expiresIn,
    });
  }

  verify(token: string) {
    return verify(token, this.options.jwtPrivateKey);
  }
}

import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';

@Module({ providers: [JwtService], exports: [JwtService] })
@Global()
export class JwtModule {}

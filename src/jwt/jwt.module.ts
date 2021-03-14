import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { IJwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({ providers: [JwtService], exports: [JwtService] })
@Global()
export class JwtModule {
  static forRoot(options: IJwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [{ provide: CONFIG_OPTIONS, useValue: options }, JwtService],
    };
  }
}

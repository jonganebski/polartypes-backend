import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/user.module';

@Module({
  imports: [UsersModule],
  providers: [],
})
export class AuthModule {}

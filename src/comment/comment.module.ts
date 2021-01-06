import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from 'src/step/entities/step.entity';
import { UsersModule } from 'src/users/user.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Step]), UsersModule],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}

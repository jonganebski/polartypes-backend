import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from 'src/step/entities/step.entity';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Step])],
  providers: [CommentResolver, CommentService],
})
export class CommentModule {}

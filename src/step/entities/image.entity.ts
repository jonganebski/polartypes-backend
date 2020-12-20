import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsUrl } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Step } from './step.entity';

@InputType('ImageInputType')
@ObjectType()
@Entity()
export class Image extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsUrl()
  url: string;

  // step
  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.images, { onDelete: 'CASCADE' })
  step: Step;

  @RelationId((image: Image) => image.step)
  stepId: number;
}

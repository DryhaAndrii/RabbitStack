import { IsUUID } from 'class-validator';

export class GetUserByIdDto {
  @IsUUID('4', { message: 'User id must be a valid UUID' })
  id!: string;
}

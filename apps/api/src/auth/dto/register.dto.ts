import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsTimeZone,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(15)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsTimeZone()
  timezone!: string;
}

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PasswordService } from './password.service.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(PasswordService)
    private readonly passwords: PasswordService,
  ) {}

  async register(input: RegisterDto) {
    const passwordHash = await this.passwords.hash(input.password);

    try {
      return await this.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          timezone: input.timezone,
        },
        select: {
          id: true,
          email: true,
          timezone: true,
          createdAt: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Unable to register with these details.');
      }

      throw error;
    }
  }
}

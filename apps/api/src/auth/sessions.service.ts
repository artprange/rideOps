import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

@Injectable()
export class SessionService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
      select: {
        id: true,
      },
    });

    return { token, expiresAt };
  }

  async validate(token: string) {
    if (!TOKEN_PATTERN.test(token)) {
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: {
        tokenHash: this.hashToken(token),
      },
      select: {
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            timezone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return session.user;
  }

  async revoke(token: string): Promise<void> {
    if (!TOKEN_PATTERN.test(token)) {
      return;
    }

    await this.prisma.session.deleteMany({
      where: {
        tokenHash: this.hashToken(token),
      },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

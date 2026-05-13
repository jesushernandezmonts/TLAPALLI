import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Note: In newer versions of NestJS, this might be handled differently
    // but we'll stick to the user's provided code.
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}

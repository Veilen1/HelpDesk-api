import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    $queryRaw: vi.fn().mockResolvedValue([1]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status object', () => {
      const response = appController.getHello();
      expect(response).toEqual({
        status: 'online',
        name: 'HelpDesk API',
        description: 'API REST para gestión de tickets de soporte',
        docs: '/docs',
        version: '1.0.0',
      });
    });
  });

  describe('health', () => {
    it('should return connected status when database responds', async () => {
      const response = await appController.getHealth();
      expect(response.status).toBe('ok');
      expect(response.database).toBe('connected');
    });
  });
});

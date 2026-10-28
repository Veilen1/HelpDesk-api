import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaMock: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'exists@example.com',
      });

      await expect(
        usersService.create({
          email: 'exists@example.com',
          name: 'Exists',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a user when email is available', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'new-id',
        email: 'new@example.com',
        name: 'New User',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await usersService.create({
        email: 'new@example.com',
        name: 'New User',
        password: 'Password123!',
      });

      expect(user.id).toBe('new-id');
      expect(user.email).toBe('new@example.com');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        role: Role.CUSTOMER,
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findById('1');
      expect(result).toEqual(mockUser);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findByEmail: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new customer and return token', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        email: 'customer@example.com',
        name: 'Customer Test',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'customer@example.com',
        password: 'Password123!',
        name: 'Customer Test',
      });

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'customer@example.com',
        password: 'Password123!',
        name: 'Customer Test',
        role: Role.CUSTOMER,
      });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user when credentials are correct', async () => {
      const password = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test',
        role: Role.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login({
        email: 'test@example.com',
        password,
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});

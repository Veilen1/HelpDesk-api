import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

export const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: dto.role ?? Role.CUSTOMER,
      },
      select: USER_SELECT_FIELDS,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT_FIELDS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario.',
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.name) data.name = dto.name;
    if (dto.role) data.role = dto.role;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT_FIELDS,
    });
  }
}

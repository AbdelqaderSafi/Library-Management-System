import { Injectable, NotFoundException } from '@nestjs/common';

import { RegisterDTO, UserResponseDTO } from '../auth/dto/auth.dto';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import { removeFields } from '../util/object.util';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/util.types';
import { updateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: DatabaseService) {}

  create(registerDTO: RegisterDTO) {
    return this.prismaService.user.create({
      data: registerDTO,
    });
  }

  findAll(
    query: PaginationQueryType,
  ): Promise<PaginationResponseType<Omit<User, 'password'>>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);
      const users = await this.prismaService.user.findMany({
        ...removeFields(pagination, ['page']),
        omit: {
          password: true,
        },
      });

      const count = await this.prismaService.user.count();
      return {
        data: users,
        ...this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count,
          limit: pagination.take,
        }),
      };
    });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, userUpdatePayload: updateUserDTO) {
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.prismaService.user.update({
      where: { id },
      data: userUpdatePayload,
      omit: {
        password: true,
      },
    });
  }

  async delete(id: string) {
    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  mapUserWithoutPassword(user: User): UserResponseDTO['userData'] {
    const userWithoutPassword = removeFields(user, ['password']);

    return {
      ...userWithoutPassword,
      id: userWithoutPassword.id,
    };
  }
}

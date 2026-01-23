import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { PaginationQueryType } from 'src/types/util.types';
import type { updateUserDTO } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import { updateUserSchema } from '../util/user.validation.schema';
import { paginationSchema } from '../util/api.util';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination (Admin/Librarian only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'] },
              createdAt: { type: 'string', format: 'date-time' },
              isDeleted: { type: 'boolean' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Librarian role required',
  })
  findAll(
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQueryType,
  ) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'] },
            createdAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user (Admin/Librarian only)' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe Updated' },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.updated@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Librarian role required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema))
    userUpdatePayload: updateUserDTO,
    @User() user: UserResponseDTO['userData'],
  ) {
    return this.userService.update(id, userUpdatePayload, user);
  }

  @Roles(['ADMIN'])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string) {
    const removedUser = await this.userService.delete(id);
    return Boolean(removedUser);
  }
}

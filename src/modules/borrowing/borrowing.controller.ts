import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import type {
  BorrowingResponseDTO,
  CreateBorrowingDTO,
} from './dto/borrowing.dto';
import type { UpdateBorrowingDTO } from './dto/borrowing.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import {
  borrowingPaginationSchema,
  borrowingValidationSchema,
  updateBorrowingValidationSchema,
} from './util/borrowing.validation';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import type { borrowQuery } from '../book/types/book.types';
import { Roles } from 'src/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Borrowing')
@ApiBearerAuth('JWT-auth')
@Controller('borrowing')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Roles(['MEMBER'])
  @Post()
  @ApiOperation({ summary: 'Create a new borrowing transaction (Member only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['bookId', 'dueDate'],
      properties: {
        bookId: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the book to borrow',
        },
        dueDate: {
          type: 'string',
          format: 'date',
          example: '2026-02-22',
          description: 'Due date for returning the book',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Borrowing transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            bookId: { type: 'string' },
            borrowDate: { type: 'string', format: 'date' },
            dueDate: { type: 'string', format: 'date' },
            returnDate: { type: 'string', format: 'date', nullable: true },
            status: {
              type: 'string',
              enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
            },
            book: { type: 'object' },
            user: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or book not available',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Member role required' })
  create(
    @Body(new ZodValidationPipe(borrowingValidationSchema))
    createBorrowingDto: CreateBorrowingDTO,
    @User() user: UserResponseDTO['userData'],
  ) {
    return this.borrowingService.create(createBorrowingDto, user);
  }

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Get()
  @ApiOperation({
    summary: 'Get all borrowing transactions (Admin/Librarian only)',
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
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of borrowing transactions',
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
              userId: { type: 'string' },
              bookId: { type: 'string' },
              borrowDate: { type: 'string', format: 'date' },
              dueDate: { type: 'string', format: 'date' },
              returnDate: { type: 'string', format: 'date', nullable: true },
              status: { type: 'string' },
              book: { type: 'object' },
              user: { type: 'object' },
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
    @Query(new ZodValidationPipe(borrowingPaginationSchema)) query: borrowQuery,
  ) {
    return this.borrowingService.findAll(query);
  }

  @Roles(['ADMIN', 'LIBRARIAN', 'MEMBER'])
  @Get(':id')
  @ApiOperation({
    summary: 'Get a borrowing transaction by ID (Admin/Librarian only)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Borrowing transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Borrowing transaction details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Librarian role required',
  })
  @ApiResponse({ status: 404, description: 'Borrowing transaction not found' })
  findOne(@Param('id') id: string) {
    return this.borrowingService.findOne(id);
  }

  @Roles(['LIBRARIAN'])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a borrowing transaction (Librarian only)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Borrowing transaction ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
          description: 'Transaction status',
        },
        returnDate: {
          type: 'string',
          format: 'date',
          example: '2026-02-15',
          description: 'Return date',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Borrowing transaction updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Librarian role required',
  })
  @ApiResponse({ status: 404, description: 'Borrowing transaction not found' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBorrowingValidationSchema))
    updateBorrowingDto: UpdateBorrowingDTO,
  ) {
    return this.borrowingService.update(id, updateBorrowingDto);
  }

  @Roles(['LIBRARIAN', 'ADMIN'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a borrowing transaction (Librarian/Admin only)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Borrowing transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Borrowing transaction deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Librarian/Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Borrowing transaction not found' })
  remove(@Param('id') id: string) {
    return this.borrowingService.remove(id);
  }
}

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
import { BookService } from './book.service';
import type { BookResponseDTO, CreateBookDTO } from './dto/book.dto';
import type { UpdateBookDTO } from './dto/book.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import {
  authorPaginationSchema,
  bookPaginationSchema,
  bookValidationSchema,
} from './util/book.validation';
import type { AuthorQuery, BookQuery } from './types/book.types';
import { Roles } from 'src/decorators/roles.decorator';
import { IsPublic } from 'src/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Books')
@ApiBearerAuth('JWT-auth')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Roles(['LIBRARIAN'])
  @Post()
  @ApiOperation({ summary: 'Create a new book (Librarian only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'publishDate',
        'stock',
        'availableStock',
        'authors',
        'categories',
      ],
      properties: {
        title: { type: 'string', example: 'The Great Gatsby' },
        description: {
          type: 'string',
          example: 'A novel by F. Scott Fitzgerald',
        },
        publishDate: { type: 'string', format: 'date', example: '1925-04-10' },
        stock: { type: 'integer', example: 10 },
        availableStock: { type: 'integer', example: 10 },
        authors: {
          type: 'array',
          items: { type: 'string' },
          example: ['F. Scott Fitzgerald'],
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          example: ['Fiction', 'Classic'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Librarian role required',
  })
  create(
    @Body(new ZodValidationPipe(bookValidationSchema))
    createBookDto: CreateBookDTO,
  ) {
    return this.bookService.create(createBookDto);
  }

  @IsPublic(true)
  @Get()
  @ApiOperation({ summary: 'Get all books with pagination and filtering' })
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
    name: 'title',
    required: false,
    type: String,
    description: 'Filter by title',
  })
  @ApiResponse({
    status: 200,
    description: 'List of books',
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
              title: { type: 'string' },
              description: { type: 'string' },
              publishDate: { type: 'string', format: 'date' },
              stock: { type: 'integer' },
              availableStock: { type: 'integer' },
              authors: { type: 'array', items: { type: 'object' } },
              categories: { type: 'array', items: { type: 'object' } },
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
  findAll(
    @Query(new ZodValidationPipe(bookPaginationSchema)) query: BookQuery,
  ) {
    return this.bookService.findAll(query);
  }

  @Get('author')
  @ApiOperation({ summary: 'Get all authors with pagination and filtering' })
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
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by author name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of authors',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllAuthor(
    @Query(new ZodValidationPipe(authorPaginationSchema)) query: AuthorQuery,
  ) {
    return this.bookService.findAllAuthor(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Book ID' })
  @ApiResponse({
    status: 200,
    description: 'Book details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  // to get author by id with his books
  @Get('author/:id')
  @ApiOperation({ summary: 'Get an author by ID with their books' })
  @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  @ApiResponse({
    status: 200,
    description: 'Author details with books',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findOneAuthor(@Param('id') id: string) {
    return this.bookService.findOneAuthor(id);
  }

  @Roles(['LIBRARIAN', 'ADMIN', 'MEMBER'])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a book (Librarian/Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Book ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'The Great Gatsby - Updated' },
        description: { type: 'string', example: 'Updated description' },
        publishDate: { type: 'string', format: 'date', example: '1925-04-10' },
        stock: { type: 'integer', example: 15 },
        availableStock: { type: 'integer', example: 12 },
        authors: { type: 'array', items: { type: 'string' } },
        categories: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Librarian/Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDTO) {
    return this.bookService.update(id, updateBookDto);
  }

  @Roles(['LIBRARIAN', 'ADMIN'])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book (Librarian/Admin only)' })
  @ApiParam({ name: 'id', type: String, description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Librarian/Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}

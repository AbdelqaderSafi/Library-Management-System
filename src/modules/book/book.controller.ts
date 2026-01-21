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

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Roles(['LIBRARIAN'])
  @Post()
  create(
    @Body(new ZodValidationPipe(bookValidationSchema))
    createBookDto: CreateBookDTO,
  ): Promise<BookResponseDTO> {
    return this.bookService.create(createBookDto);
  }

  @IsPublic(true)
  @Get()
  findAll(
    @Query(new ZodValidationPipe(bookPaginationSchema)) query: BookQuery,
  ) {
    return this.bookService.findAll(query);
  }

  @Get('author')
  findAllAuthor(
    @Query(new ZodValidationPipe(authorPaginationSchema)) query: AuthorQuery,
  ) {
    return this.bookService.findAllAuthor(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  // to get author by id with his books
  @Get('author/:id')
  findOneAuthor(@Param('id') id: string) {
    return this.bookService.findOneAuthor(id);
  }

  @Roles(['LIBRARIAN', 'ADMIN'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDTO) {
    return this.bookService.update(id, updateBookDto);
  }

  @Roles(['LIBRARIAN', 'ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { BookResponseDTO, CreateBookDTO } from './dto/book.dto';
import { UpdateBookDTO } from './dto/book.dto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { AuthorQuery, BookQuery } from './types/book.types';
import { removeFields } from '../util/object.util';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: DatabaseService) {}
  create(createBookDto: CreateBookDTO) {
    const { authors, categories, ...bookData } = createBookDto;

    return this.prismaService.book.create({
      data: {
        ...bookData,
        authors: {
          connectOrCreate: authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        categories: {
          connectOrCreate: categories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: {
        authors: true,
        categories: true,
      },
    });
  }

  findAll(query: BookQuery) {
    return this.prismaService.$transaction(async (prisma) => {
      const whereClause: Prisma.BookWhereInput = query.title
        ? {
            title: { contains: query.title },
          }
        : {};
      const pagination = this.prismaService.handleQueryPagination(query);
      const books = await prisma.book.findMany({
        ...removeFields(pagination, ['page']),
        where: whereClause,
      });

      const count = await prisma.book.count({
        where: whereClause,
      });

      return {
        data: books,
        ...this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count,
          limit: pagination.take,
        }),
      };
    });
  }

  async findOne(id: string) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: {
        authors: true,
        categories: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  findAllAuthor(query: AuthorQuery) {
    return this.prismaService.$transaction(async (prisma) => {
      const whereClause: Prisma.AuthorWhereInput = query.name
        ? {
            name: { contains: query.name },
          }
        : {};
      const pagination = this.prismaService.handleQueryPagination(query);
      const authors = await prisma.author.findMany({
        ...removeFields(pagination, ['page']),
        where: whereClause,
      });

      const count = await prisma.author.count({
        where: whereClause,
      });

      return {
        data: authors,
        ...this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count,
          limit: pagination.take,
        }),
      };
    });
  }

  async findOneAuthor(id: string) {
    const author = await this.prismaService.author.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }

    return author;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDTO,
  ): Promise<BookResponseDTO> {
    // Check if book exists first
    const existingBook = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    if (existingBook.isDeleted) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    const { authors, categories, ...bookData } = updateBookDto;

    const dataPayload: Prisma.BookUpdateInput = {
      ...bookData,
      ...(authors && {
        authors: {
          set: [],
          connectOrCreate: authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
      ...(categories && {
        categories: {
          set: [],
          connectOrCreate: categories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    };

    return this.prismaService.book.update({
      where: { id },
      data: dataPayload,
      include: {
        authors: true,
        categories: true,
      },
    });
  }

  async remove(id: string) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    if (book.isDeleted) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return this.prismaService.book.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

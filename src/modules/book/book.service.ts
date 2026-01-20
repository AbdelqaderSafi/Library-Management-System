import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.prismaService.book.findUnique({
      where: { id },
      include: {
        authors: true,
        categories: true,
      },
    });
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

  findOneAuthor(id: string) {
    return this.prismaService.author.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDTO,
  ): Promise<BookResponseDTO> {
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

  remove(id: string) {
    return this.prismaService.book.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

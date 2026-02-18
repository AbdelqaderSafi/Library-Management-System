import { Injectable, NotFoundException } from '@nestjs/common';
import { BookResponseDTO, CreateBookDTO } from './dto/book.dto';
import { UpdateBookDTO } from './dto/book.dto';
import { DatabaseService } from '../database/database.service';
import { AuthorQuery, BookQuery } from './types/book.types';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Author } from './schemas/author.schema';
import { Category } from './schemas/category.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly dbService: DatabaseService,
  ) {}

  async create(createBookDto: CreateBookDTO) {
    const { authors, categories, ...bookData } = createBookDto;

    const authorIds = await Promise.all(
      authors.map(async (name) => {
        let author = await this.authorModel.findOne({ name });
        if (!author) {
          author = await this.authorModel.create({ name });
        }
        return author._id;
      }),
    );

    const categoryIds = await Promise.all(
      categories.map(async (name) => {
        let category = await this.categoryModel.findOne({ name });
        if (!category) {
          category = await this.categoryModel.create({ name });
        }
        return category._id;
      }),
    );

    const book = await this.bookModel.create({
      ...bookData,
      description: bookData.description ?? undefined,
      authors: authorIds,
      categories: categoryIds,
    });

    return book.populate(['authors', 'categories']);
  }

  async findAll(query: BookQuery) {
    const whereClause: any = { isDeleted: false };

    if (query.title) {
      whereClause.title = { $regex: query.title, $options: 'i' };
    }

    const pagination = this.dbService.handleQueryPagination(query);

    const [books, count] = await Promise.all([
      this.bookModel
        .find(whereClause)
        .skip(pagination.skip)
        .limit(pagination.take)
        .populate('authors', 'name')
        .populate('categories', 'name')
        .exec(),
      this.bookModel.countDocuments(whereClause).exec(),
    ]);

    return {
      data: books,
      ...this.dbService.formatPaginationResponse({
        page: pagination.page,
        count: count,
        limit: pagination.take,
      }),
    };
  }

  async findOne(id: string) {
    const book = await this.bookModel
      .findOne({ _id: id, isDeleted: false })
      .populate('authors', 'name')
      .populate('categories', 'name')
      .exec();

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  async findAllAuthor(query: AuthorQuery) {
    const whereClause: any = query.name
      ? { name: { $regex: query.name, $options: 'i' } }
      : {};

    const pagination = this.dbService.handleQueryPagination(query);
    const authors = await this.authorModel
      .find(whereClause)
      .skip(pagination.skip)
      .limit(pagination.take)
      .populate('books', 'title')
      .exec();

    const count = await this.authorModel.countDocuments(whereClause);

    return {
      data: authors,
      ...this.dbService.formatPaginationResponse({
        page: pagination.page,
        count,
        limit: pagination.take,
      }),
    };
  }

  async findOneAuthor(id: string) {
    const author = await this.authorModel
      .findById(id)
      .populate('books', 'title')
      .exec();

    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }

    return author;
  }

  async update(id: string, updateBookDto: UpdateBookDTO) {
    const { authors, categories, ...bookData } = updateBookDto;

    const updatePayload: any = {
      ...bookData,
      description: bookData.description ?? undefined,
    };

    if (authors) {
      updatePayload.authors = await Promise.all(
        authors.map((name) =>
          this.authorModel
            .findOneAndUpdate(
              { name },
              { name },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            )
            .then((doc) => doc._id),
        ),
      );
    }

    if (categories) {
      updatePayload.categories = await Promise.all(
        categories.map((name) =>
          this.categoryModel
            .findOneAndUpdate(
              { name },
              { name },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            )
            .then((doc) => doc._id),
        ),
      );
    }

    const updatedBook = await this.bookModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updatePayload, {
        new: true,
      })
      .populate('authors categories')
      .exec();

    if (!updatedBook) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return updatedBook;
  }

  async remove(id: string) {
    const deletedBook = await this.bookModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();

    if (!deletedBook) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return deletedBook;
  }
}

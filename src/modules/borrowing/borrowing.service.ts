import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateBorrowingDTO } from './dto/borrowing.dto';
import { UpdateBorrowingDTO } from './dto/borrowing.dto';
import { DatabaseService } from '../database/database.service';
import { borrowQuery } from '../book/types/book.types';
import { InjectModel } from '@nestjs/mongoose';
import { BorrowTransaction } from './schemas/borrow-transaction.schema';
import { Book } from '../book/schemas/book.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BorrowingService {
  private readonly logger = new Logger(BorrowingService.name);

  constructor(
    @InjectModel(BorrowTransaction.name)
    private borrowModel: Model<BorrowTransaction>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private readonly dbService: DatabaseService,
  ) {}

  async create(
    createBorrowingDto: CreateBorrowingDTO,
    user: Express.Request['user'],
  ) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { bookId, dueDate } = createBorrowingDto;

    // Check if book exists
    const book = await this.bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.availableStock < 1) {
      throw new BadRequestException('Book is out of stock');
    }

    // Check if user already borrowed this book
    const existingBorrow = await this.borrowModel.findOne({
      userId: user.id,
      bookId: bookId,
      status: { $in: ['BORROWED', 'OVERDUE'] },
    });

    if (existingBorrow) {
      throw new BadRequestException('You already have this book borrowed');
    }

    // Decrease available stock
    await this.bookModel.updateOne(
      { _id: bookId },
      { $inc: { availableStock: -1 } },
    );

    // Create borrowing record
    const newBorrowing = await this.borrowModel.create({
      userId: new Types.ObjectId(user.id),
      bookId: new Types.ObjectId(bookId),
      dueDate: dueDate,
      status: 'BORROWED',
    });

    // Return with populated fields
    return this.borrowModel
      .findById(newBorrowing._id)
      .populate('bookId', 'title')
      .populate('userId', 'name email')
      .exec();
  }

  async findAll(query: borrowQuery) {
    const whereClause: any = query.status ? { status: query.status } : {};

    const pagination = this.dbService.handleQueryPagination(query);

    const [borrowTransactions, count] = await Promise.all([
      this.borrowModel
        .find(whereClause)
        .skip(pagination.skip)
        .limit(pagination.take)
        .populate('bookId', 'title')
        .populate('userId', 'name email')
        .exec(),
      this.borrowModel.countDocuments(whereClause),
    ]);

    return {
      data: borrowTransactions,
      ...this.dbService.formatPaginationResponse({
        page: pagination.page,
        count,
        limit: pagination.take,
      }),
    };
  }

  async findOne(id: string) {
    const borrowTransaction = await this.borrowModel
      .findOne({ _id: id })
      .populate('bookId', 'title')
      .populate('userId', 'name email');

    if (!borrowTransaction) {
      throw new NotFoundException(`Borrow transaction with id ${id} not found`);
    }

    return borrowTransaction;
  }

  async update(id: string, updateBorrowingDto: UpdateBorrowingDTO) {
    // Get current borrow transaction
    const borrowTransaction = await this.borrowModel.findById(id);

    if (!borrowTransaction) {
      throw new NotFoundException('Borrow transaction not found');
    }

    // If status is changing to RETURNED, increment available stock
    if (
      updateBorrowingDto.status === 'RETURNED' &&
      borrowTransaction.status !== 'RETURNED'
    ) {
      await this.bookModel.updateOne(
        { _id: borrowTransaction.bookId },
        { $inc: { availableStock: 1 } },
      );

      // Set return date if not provided
      if (!updateBorrowingDto.returnDate) {
        updateBorrowingDto.returnDate = new Date();
      }
    }

    const updated = await this.borrowModel.findByIdAndUpdate(
      id,
      updateBorrowingDto,
      { new: true },
    );

    return updated;
  }

  async remove(id: string) {
    const deletedTransaction = await this.borrowModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true },
      )
      .exec();

    if (!deletedTransaction) {
      throw new NotFoundException(`Borrow transaction with id ${id} not found`);
    }

    return deletedTransaction;
  }

  // Cron job that runs every day at midnight
  // Updates all BORROWED transactions to OVERDUE if dueDate has passed
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOverdueStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.borrowModel.updateMany(
      {
        status: 'BORROWED',
        dueDate: { $lt: today },
      },
      {
        $set: { status: 'OVERDUE' },
      },
    );

    this.logger.log(
      `Updated ${result.modifiedCount} transactions to OVERDUE status`,
    );

    return result;
  }
}

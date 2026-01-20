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

@Injectable()
export class BorrowingService {
  private readonly logger = new Logger(BorrowingService.name);

  constructor(private readonly prisma: DatabaseService) {}

  async create(
    createBorrowingDto: CreateBorrowingDTO,
    user: Express.Request['user'],
  ) {
    // 1. Check user authentication first
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // 2. Use transaction to ensure data consistency
    return this.prisma.$transaction(async (tx) => {
      // 3. Check if book exists
      const book = await tx.book.findUnique({
        where: { id: createBorrowingDto.bookId },
      });

      if (!book || book.isDeleted) {
        throw new NotFoundException('Book not found');
      }

      // 4. Check stock availability
      if (book.availableStock < 1) {
        throw new BadRequestException('Book is out of stock');
      }

      // 5. Check if user already borrowed this book (and not returned)
      const existingBorrow = await tx.borrowTransaction.findFirst({
        where: {
          userId: user.id,
          bookId: createBorrowingDto.bookId,
          status: { in: ['BORROWED', 'OVERDUE'] },
        },
      });

      if (existingBorrow) {
        throw new BadRequestException('You already have this book borrowed');
      }

      // 6. Decrease available stock
      await tx.book.update({
        where: { id: createBorrowingDto.bookId },
        data: { availableStock: { decrement: 1 } },
      });

      // 7. Create borrowing record
      const borrowing = await tx.borrowTransaction.create({
        data: {
          userId: user.id,
          bookId: createBorrowingDto.bookId,
          dueDate: createBorrowingDto.dueDate,
        },
        include: { book: true, user: true },
      });

      return borrowing;
    });
  }

  findAll() {
    return `This action returns all borrowing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowing`;
  }

  update(id: number, updateBorrowingDto: UpdateBorrowingDTO) {
    return `This action updates a #${id} borrowing`;
  }

  remove(id: number) {
    return `This action removes a #${id} borrowing`;
  }

  // Cron job that runs every day at midnight
  // Updates all BORROWED transactions to OVERDUE if dueDate has passed
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOverdueStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.borrowTransaction.updateMany({
      where: {
        status: 'BORROWED',
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    this.logger.log(`Updated ${result.count} transactions to OVERDUE status`);
    return result;
  }
}

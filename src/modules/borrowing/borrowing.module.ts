import { Module } from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { BorrowingController } from './borrowing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BorrowTransaction,
  BorrowTransactionSchema,
} from './schemas/borrow-transaction.schema';
import { Book, BookSchema } from '../book/schemas/book.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BorrowTransaction.name, schema: BorrowTransactionSchema },
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BorrowingController],
  providers: [BorrowingService],
})
export class BorrowingModule {}

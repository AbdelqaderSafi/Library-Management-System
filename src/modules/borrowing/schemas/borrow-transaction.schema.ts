import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BorrowTransactionDocument = HydratedDocument<BorrowTransaction>;

export enum TransactionStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
}

@Schema({ collection: 'borrow_transactions' })
export class BorrowTransaction {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Book' })
  bookId: Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  borrowDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ type: Date })
  returnDate?: Date;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.BORROWED,
  })
  status: TransactionStatus;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BorrowTransactionSchema =
  SchemaFactory.createForClass(BorrowTransaction);

BorrowTransactionSchema.index({ userId: 1 });
BorrowTransactionSchema.index({ bookId: 1 });
BorrowTransactionSchema.index({ status: 1 });
BorrowTransactionSchema.index({ isDeleted: 1 });
BorrowTransactionSchema.index({ borrowDate: -1 });
BorrowTransactionSchema.index({ dueDate: 1 });

import { Prisma } from '@prisma/client';
import { BorrowTransaction } from 'generated/prisma';

export type CreateBorrowingDTO = Pick<BorrowTransaction, 'bookId' | 'dueDate'>;

export type UpdateBorrowingDTO = Partial<
  Pick<BorrowTransaction, 'status' | 'returnDate'>
>;

export type BorrowingResponseDTO = Prisma.BorrowTransactionGetPayload<{
  include: { book: true; user: true };
}>;

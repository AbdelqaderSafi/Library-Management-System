import { z, ZodType } from 'zod';
import { CreateBorrowingDTO, UpdateBorrowingDTO } from '../dto/borrowing.dto';
import { paginationSchema } from 'src/modules/util/api.util';
import { BookQuery, borrowQuery } from 'src/modules/book/types/book.types';

export const borrowingValidationSchema = z.object({
  dueDate: z.coerce.date(),
  bookId: z.string().min(1),
}) satisfies ZodType<CreateBorrowingDTO>;

export const updateBorrowingValidationSchema = z.object({
  status: z.enum(['BORROWED', 'RETURNED', 'OVERDUE']).optional(),
  returnDate: z.coerce.date().optional(),
}) satisfies ZodType<Partial<UpdateBorrowingDTO>>;

export const borrowingPaginationSchema = paginationSchema.extend({
  status: z.enum(['BORROWED', 'RETURNED', 'OVERDUE']).optional(),
}) satisfies ZodType<borrowQuery>;

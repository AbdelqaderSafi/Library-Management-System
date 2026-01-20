import { z, ZodType } from 'zod';
import { CreateBorrowingDTO, UpdateBorrowingDTO } from '../dto/borrowing.dto';

export const borrowingValidationSchema = z.object({
  dueDate: z.coerce.date(),
  bookId: z.string().min(1),
}) satisfies ZodType<CreateBorrowingDTO>;

export const updateBorrowingValidationSchema = z.object({
  status: z.enum(['BORROWED', 'RETURNED', 'OVERDUE']).optional(),
  returnDate: z.coerce.date().optional(),
}) satisfies ZodType<Partial<UpdateBorrowingDTO>>;

import { z, ZodType } from 'zod';
import { CreateBookDTO, UpdateBookDTO } from '../dto/book.dto';
import { paginationSchema } from 'src/modules/util/api.util';
import { AuthorQuery, BookQuery } from '../types/book.types';

export const bookValidationSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(1000),
  stock: z.number().min(0),
  availableStock: z.number().min(0),
  publishDate: z.coerce.date(),
  authors: z.array(z.string().min(1)).min(1),
  categories: z.array(z.string().min(1)).min(1),
}) satisfies ZodType<CreateBookDTO>;

export const updatebookValidationSchema =
  bookValidationSchema.partial() satisfies ZodType<Partial<UpdateBookDTO>>;

export const bookPaginationSchema = paginationSchema.extend({
  title: z.string().min(1).max(255).optional(),
}) satisfies ZodType<BookQuery>;

export const authorPaginationSchema = paginationSchema.extend({
  name: z.string().min(1).max(255).optional(),
}) satisfies ZodType<AuthorQuery>;

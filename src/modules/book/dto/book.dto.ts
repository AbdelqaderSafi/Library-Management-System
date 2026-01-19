import { Book, Prisma } from '@prisma/client';

export type CreateBookDTO = Pick<
  Book,
  'title' | 'description' | 'publishDate' | 'stock' | 'availableStock'
> & { authors: string[]; categories: string[] };

export type UpdateBookDTO = Partial<CreateBookDTO>;

export type BookResponseDTO = Prisma.BookGetPayload<{
  include: { authors: true; categories: true };
}>;

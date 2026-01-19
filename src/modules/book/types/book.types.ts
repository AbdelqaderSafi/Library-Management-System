import { PaginationQueryType } from 'src/types/util.types';

export type BookQuery = PaginationQueryType & {
  title?: string;
};
export type AuthorQuery = PaginationQueryType & {
  name?: string;
};

import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type PaginationQueryType = {
  page?: number;
  limit?: number;
};

export type PaginationResponseMetaDataType = {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PaginationResponseType<T> = {
  data: T[];
} & PaginationResponseMetaDataType;

export type TransactionClient = Prisma.TransactionClient;

export type ApiSuccessResponse<T> = {
  success: true;
  data: T | T[];
} & Partial<PaginationResponseMetaDataType>;

export type ApiErrorResponse = {
  success: false;
  message: string;
  timestamp: string;
  statusCode: HttpStatus;
  path: string;
  fields?: { field: string; message: string }[];
};

export type UnifiedResponse<T> = ApiSuccessResponse<T>;

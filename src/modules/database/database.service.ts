import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  PaginationQueryType,
  PaginationResponseMetaDataType,
} from 'src/types/util.types';

@Injectable()
export class DatabaseService {
  handleQueryPagination(query: PaginationQueryType) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    return {
      skip: (page - 1) * limit,
      take: limit,
      page,
    };
  }
  formatPaginationResponse(args: {
    page: number;
    count: number;
    limit: number;
  }): PaginationResponseMetaDataType {
    return {
      meta: {
        total: args.count,
        page: args.page,
        limit: args.limit,
        totalPages: Math.ceil(args.count / args.limit),
      },
    };
  }
}

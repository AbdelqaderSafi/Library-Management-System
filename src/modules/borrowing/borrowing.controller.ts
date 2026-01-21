import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import type {
  BorrowingResponseDTO,
  CreateBorrowingDTO,
} from './dto/borrowing.dto';
import type { UpdateBorrowingDTO } from './dto/borrowing.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import {
  borrowingPaginationSchema,
  borrowingValidationSchema,
  updateBorrowingValidationSchema,
} from './util/borrowing.validation';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import type { borrowQuery } from '../book/types/book.types';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('borrowing')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Roles(['MEMBER'])
  @Post()
  create(
    @Body(new ZodValidationPipe(borrowingValidationSchema))
    createBorrowingDto: CreateBorrowingDTO,
    @User() user: UserResponseDTO['userData'],
  ): Promise<BorrowingResponseDTO> {
    return this.borrowingService.create(createBorrowingDto, user);
  }

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Get()
  findAll(
    @Query(new ZodValidationPipe(borrowingPaginationSchema)) query: borrowQuery,
  ) {
    return this.borrowingService.findAll(query);
  }

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowingService.findOne(id);
  }

  @Roles(['LIBRARIAN'])
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBorrowingValidationSchema))
    updateBorrowingDto: UpdateBorrowingDTO,
  ) {
    return this.borrowingService.update(id, updateBorrowingDto);
  }

  @Roles(['LIBRARIAN', 'ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowingService.remove(id);
  }
}

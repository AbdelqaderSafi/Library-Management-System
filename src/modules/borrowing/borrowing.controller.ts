import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import type {
  BorrowingResponseDTO,
  CreateBorrowingDTO,
} from './dto/borrowing.dto';
import type { UpdateBorrowingDTO } from './dto/borrowing.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import { borrowingValidationSchema } from './util/borrowing.validation';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';

@Controller('borrowing')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(borrowingValidationSchema))
    createBorrowingDto: CreateBorrowingDTO,
    @User() user: UserResponseDTO['userData'],
  ): Promise<BorrowingResponseDTO> {
    return this.borrowingService.create(createBorrowingDto, user);
  }

  @Get()
  findAll() {
    return this.borrowingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowingService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body(ZodValidationPipe(updateBorrowingValidationSchema))
  //   updateBorrowingDto: UpdateBorrowingDTO,
  // ) {
  //   return this.borrowingService.update(+id, updateBorrowingDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowingService.remove(+id);
  }
}

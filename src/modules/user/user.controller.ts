import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { PaginationQueryType } from 'src/types/util.types';
import type { updateUserDTO } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';
import { updateUserSchema } from '../util/user.validation.schema';
import { paginationSchema } from '../util/api.util';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Get()
  findAll(
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQueryType,
  ) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Roles(['ADMIN', 'LIBRARIAN'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema))
    userUpdatePayload: updateUserDTO,
    @User() user: UserResponseDTO['userData'],
  ) {
    return this.userService.update(id, userUpdatePayload, user);
  }

  @Roles(['ADMIN'])
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const removedUser = await this.userService.delete(id);
    return Boolean(removedUser);
  }
}

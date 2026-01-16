import { Controller, Get, Post, Body, Req, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { LoginDTO, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { IsPublic } from 'src/decorators/public.decorator';
import { registerValidationSchema } from './util/auth.validation.schema';
import { ZodValidationPipe } from 'src/pipes/zod.validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic(true)
  async create(
    @Body(new ZodValidationPipe(registerValidationSchema))
    registerDTO: RegisterDTO,
  ): Promise<UserResponseDTO> {
    const createdUser = await this.authService.register(registerDTO);
    return createdUser;
  }

  @Post('login')
  @IsPublic(true)
  login(@Body() loginDTO: LoginDTO): Promise<UserResponseDTO> {
    return this.authService.login(loginDTO);
  }

  @Get()
  validate(@Req() request: Request): UserResponseDTO {
    return this.authService.validate(request.user!);
  }
}

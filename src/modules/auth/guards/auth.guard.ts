import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Token_Payload } from '../types/user-auth.type';
import { removeFields } from 'src/modules/util/object.util';
import { Reflector } from '@nestjs/core';
import { IsPublic } from 'src/decorators/public.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/modules/user/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    // route public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // get request
    const req = context.switchToHttp().getRequest<Request>();

    // authorization header
    const authHeader = req.headers.authorization;
    // auth header = "Bearer <token>"
    const jwt = authHeader?.split(' ')[1];
    if (!jwt) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // validate jwt
      const payload = this.jwtService.verify<Token_Payload>(jwt);

      // get user from db
      const user = await this.userModel.findById(payload.sub).exec();

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isDeleted) {
        throw new UnauthorizedException('User account has been deleted');
      }

      // attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt!,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RegisterDTO, UserResponseDTO } from '../auth/dto/auth.dto';
import { removeFields } from '../util/object.util';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/util.types';
import { updateUserDTO } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private dbService: DatabaseService,
  ) {}

  async create(registerDTO: RegisterDTO) {
    const newUser = await new this.userModel(registerDTO);
    return newUser.save();
  }

  async findAll(
    query: PaginationQueryType,
  ): Promise<PaginationResponseType<Omit<User, 'password'>>> {
    const pagination = this.dbService.handleQueryPagination(query);
    const users = await this.userModel
      .find()
      .skip(pagination.skip)
      .limit(pagination.take)
      .select('-password')
      .exec();

    const count = await this.userModel.countDocuments();

    return {
      data: users,
      ...this.dbService.formatPaginationResponse({
        page: pagination.page,
        count,
        limit: pagination.take,
      }),
    };
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate({
        path: 'transactions',
        populate: { path: 'bookId', select: 'title' },
      })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Debug log
    console.log('User object:', JSON.stringify(user, null, 2));

    return user;
  }

  async update(
    id: string,
    userUpdatePayload: updateUserDTO,
    user: Express.Request['user'],
  ) {
    // Check if user exists
    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Check if the user is trying to update their own data
    if (user!.id?.toString() !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userUpdatePayload, {
        new: true,
      })
      .select('-password')
      .exec();

    return updatedUser;
  }

  async delete(id: string) {
    const deletedUser = await this.userModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return deletedUser;
  }

  mapUserWithoutPassword(user: UserDocument): UserResponseDTO['userData'] {
    const userObject = user.toObject();

    const { password, __v, ...rest } = userObject;

    return {
      ...rest,
      id: userObject._id.toString(),
      createdAt: userObject.createdAt!,
    };
  }
}

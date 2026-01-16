import { User } from '@prisma/client';

export type RegisterDTO = Pick<User, 'name' | 'email' | 'password' | 'role'>;

export type UserResponseDTO = {
  token: string;
  userData: Omit<User, 'password'>;
};

export type LoginDTO = Pick<User, 'email' | 'password'>;

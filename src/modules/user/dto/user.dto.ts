import { User } from '@prisma/client';

export type updateUserDTO = Partial<Pick<User, 'name' | 'email'>>;

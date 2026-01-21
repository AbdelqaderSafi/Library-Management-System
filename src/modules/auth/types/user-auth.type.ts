import { UserRole } from 'generated/prisma';

export type Token_Payload = {
  sub: string;
  role: UserRole;
};

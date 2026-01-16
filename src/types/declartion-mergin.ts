import { UserResponseDTO } from 'src/modules/auth/dto/auth.dto';

export type EnvVariables = {
  JWT_SECRET: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDTO['userData'];
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}

import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodType<T>) {}

  transform(value: T, metadata: ArgumentMetadata) {
    const parsedValue = this.schema.parse(value);
    console.log(metadata, 'metadata');
    console.log(parsedValue, 'parsed value');
    return parsedValue;
  }
}

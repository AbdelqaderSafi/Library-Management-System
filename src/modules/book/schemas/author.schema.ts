import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ collection: 'authors' })
export class Author {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.ObjectId[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.index({ name: 1 });

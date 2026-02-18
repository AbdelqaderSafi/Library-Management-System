import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories' })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

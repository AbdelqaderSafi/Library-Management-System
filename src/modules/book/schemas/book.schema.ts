import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({
  timestamps: true,
  collection: 'books',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Book {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, type: Date })
  publishDate: Date;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true, min: 0 })
  availableStock: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Author' }] })
  authors: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ title: 'text' });
BookSchema.index({ isDeleted: 1 });

// Virtual populate: get all transactions for this book
BookSchema.virtual('transactions', {
  ref: 'BorrowTransaction',
  localField: '_id',
  foreignField: 'bookId',
});

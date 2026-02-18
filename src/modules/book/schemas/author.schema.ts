import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({
  collection: 'authors',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Author {
  @Prop({ required: true, unique: true, trim: true })
  name: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

// Virtual populate: get books that reference this author
AuthorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'authors',
});

import mongoose, { Schema, Document } from 'mongoose';
import { IFlashcard } from './Flashcard';

export interface INote extends Document {
  userId: string;
  title: string;
  rawText: string;
  summary: string;
  flashcards: IFlashcard['_id'][];
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    rawText: { type: String, required: true },
    summary: { type: String, required: true },
    flashcards: [{ type: Schema.Types.ObjectId, ref: 'Flashcard' }],
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<INote>('Note', NoteSchema);
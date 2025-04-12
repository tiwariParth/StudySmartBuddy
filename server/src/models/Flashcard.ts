import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  userId: string;
  noteId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
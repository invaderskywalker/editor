import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  author: string;
  text: string;
  createdAt: Date;
  layerId?: Types.ObjectId;
}

const CommentSchema = new Schema<IComment>({
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  layerId: { type: Schema.Types.ObjectId, ref: 'Layer', required: false }
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);

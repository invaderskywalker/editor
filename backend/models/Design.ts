// models/Design.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ILayer {
  _id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  data: any; // Fabric object JSON
}

export interface IComment {
  _id: string;
  author: string;
  text: string;
  createdAt: Date;
  objectId?: string; // links to Fabric object
}

export interface IDesign extends Document {
  title: string;
  owner: string;
  canvas: any; // full Fabric JSON
  layers: ILayer[];
  comments: IComment[];
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LayerSchema = new Schema<ILayer>({
  name: { type: String, required: true },
  visible: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
  data: { type: Schema.Types.Mixed, required: true }
});

const CommentSchema = new Schema<IComment>({
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  objectId: { type: String }
});

const DesignSchema = new Schema<IDesign>({
  title: { type: String, required: true },
  owner: { type: String, required: true, default: 'anonymous' },
  canvas: { type: Schema.Types.Mixed, default: { version: '5.3.0', objects: [] } },
  layers: { type: [LayerSchema], default: [] },
  comments: { type: [CommentSchema], default: [] },
  thumbnail: { type: String }
}, { timestamps: true });

DesignSchema.index({ updatedAt: -1 });

export const Design = mongoose.model<IDesign>('Design', DesignSchema);
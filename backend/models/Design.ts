import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILayer extends Document {
  name: string;
  data: any; // FabricJS JSON structure or similar
}

export interface IComment extends Document {
  author: string; // Could be ObjectId referencing User in a full app
  text: string;
  createdAt: Date;
  layerId?: Types.ObjectId;
}

export interface IDesign extends Document {
  title: string;
  owner: string; // Could be ObjectId referencing User
  layers: ILayer[]; // Denormalized, or could be ObjectId[] if normalized in layers collection
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const LayerSchema = new Schema<ILayer>({
  name: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true }
});

const CommentSchema = new Schema<IComment>({
  author: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  layerId: { type: Schema.Types.ObjectId, ref: 'Layer', required: false }
});

const DesignSchema = new Schema<IDesign>({
  title: { type: String, required: true },
  owner: { type: String, required: true },
  layers: { type: [LayerSchema], default: [] },
  comments: { type: [CommentSchema], default: [] }
}, {
  timestamps: true
});

export const Design = mongoose.model<IDesign>('Design', DesignSchema);

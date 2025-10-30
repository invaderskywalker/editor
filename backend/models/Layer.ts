import mongoose, { Document, Schema } from 'mongoose';

export interface ILayer extends Document {
  name: string;
  data: any; // FabricJS JSON or similar for layer content
}

const LayerSchema = new Schema<ILayer>({
  name: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true }
});

export const Layer = mongoose.model<ILayer>('Layer', LayerSchema);

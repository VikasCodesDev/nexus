import { Schema, model, Types } from 'mongoose';

export interface IMessage {
  from: Types.ObjectId;
  to: Types.ObjectId;
  content: string;
  readAt?: Date;
  createdAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    readAt: { type: Date }
  },
  { timestamps: true }
);

messageSchema.index({ from: 1, to: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', messageSchema);

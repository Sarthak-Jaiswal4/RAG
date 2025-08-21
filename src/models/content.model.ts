import mongoose, { Document, Schema } from "mongoose";

interface segment {
  segment_id: number;
  segment_start: number;
  segment_end: number;
}

export interface contentSchema extends Document {
    sourceType: "static" | "web";
    chunk_index?:  number,
    title?: string;
    text: string;
    embedding: number[]; // Vector embedding for similarity search
    metadata?: {
        static?: {
            fileName?: string;
            pageNumber?: number;
            segment?: segment;
        };
        web?: {
            url?: string;
            snippet?: string;
            fetchedAt?: Date;
            segment?: segment;
        };
  };
  createdAt?: Date;
}

const BaseContentSchema: Schema<contentSchema> = new Schema (
  {
    sourceType: {
      type: String,
      enum: ["static", "web"],
      required: true,
    },
    chunk_index:{ type:Number },
    title: { type: String, required: false },
    text: { type: String, required: true },
    embedding: {
      type: [Number],
      required: true,
      index: "2dsphere", // or whatever vector index your setup uses
    },
    metadata: {
      static: {
        fileName: { type: String, required: true },
        pageNumber: Number,
        segment:{
          segment_id: { type: Number, required: false },
          segment_start: { type: Number, required: false },
          segment_end: { type: Number, required: false },
        }
      },
      web: {
        url: String,
        snippet: String,
        fetchedAt: Date,
        segment:{
          segment_id: Number,
          segment_start: Number,
          segment_end: Number,
        }
      },
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    discriminatorKey: "sourceType",
  }
);

const contentModel =
  (mongoose.models.contentmodel as mongoose.Model<contentSchema>) ||
  mongoose.model("contentmodel", BaseContentSchema);
export default contentModel;
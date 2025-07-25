import contentModel from "@/models/content.model";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL
if (!mongoUrl) throw new Error("MONGO_URL environment variable is not set.");
async function vectorIndexCreate() {
    await mongoose.connect(process.env.MONGO_URL!);
    const collection = contentModel.collection;
    const vectorindex = {
        name: "dense_embedding",
        type: "vectorSearch",
        definition: {
            fields: [
                {
                    type: "vector",
                    numDimensions: 1024,
                    path: "embedding",
                    similarity: "cosine",
                },
            ],
        },
    };

    const similarityindex = {
      name: "sparse_embedding",
      type: "search",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            text: {
              type: "string",
              analyzer: "lucene.english",
              searchAnalyzer: "lucene.english",
            },
            title: {
              type: "string",
              analyzer: "lucene.english",
              searchAnalyzer: "lucene.english",
            },
            metadata: {
              type: "document",
              fields: {
                static: {
                  type: "document",
                  fields: {
                    fileName: { type: "string" },
                    pageNumber: { type: "number" },
                    segment: {
                      type: "document",
                      fields: {
                        segment_id: { type: "number" },
                        segment_start: { type: "number" },
                        segment_end: { type: "number" },
                      },
                    },
                  },
                },
                web: {
                  type: "document",
                  fields: {
                    url: { type: "string",},
                    snippet: {
                      type: "string",
                      analyzer: "lucene.english",
                      searchAnalyzer: "lucene.english",
                    },
                    fetchedAt: { type: "date" },
                    segment: {
                      type: "document",
                      fields: {
                        segment_id: { type: "number" },
                        segment_start: { type: "number" },
                        segment_end: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    try {
        const result1 = await collection.createSearchIndex(vectorindex);
        const result2 = await collection.createSearchIndex(similarityindex);
        console.log("Vector index created", result1);
        console.log("search index created", result2);
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
    return;
}

export default vectorIndexCreate
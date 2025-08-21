export interface ContentData {
    sourceType: "static" | "web";
    text: string;
    embedding: number[];
    metadata: {
      static?: {
        fileName: string;
        pageNumber: number;
      };
      web?: {
        url?: string;
        snippet?: string;
        fetchedAt?: Date;
      };
    };
  }
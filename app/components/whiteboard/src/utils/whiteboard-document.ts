import type { WhiteboardDocument } from "../types";

export const serializeWhiteboardDocument = (document: WhiteboardDocument): string => JSON.stringify(document, null, 2);

export const parseWhiteboardDocument = (source: string): WhiteboardDocument => {
  // Structural validation is intentionally deferred by product requirement.
  return JSON.parse(source) as WhiteboardDocument;
};

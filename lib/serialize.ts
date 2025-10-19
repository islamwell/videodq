import type { Document } from 'mongoose';

export function serializeDocument<T extends Document>(doc: T) {
  return JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
}

export function serializeDocuments<T extends Document>(docs: T[]) {
  return docs.map((doc) => serializeDocument(doc));
}

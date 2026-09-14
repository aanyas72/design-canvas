import { Asset } from "@/lib/assets";
import { CanvasItem } from "@/components/KonvaAsset";

export function generateRoomId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export interface PresenceMeta {
  name: string;
  color: string;
}

export interface CursorPayload {
  clientId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface ItemAddPayload {
  item: CanvasItem;
}

export interface ItemChangePayload {
  instanceId: string;
  updates: Partial<CanvasItem>;
}

export interface ItemDeletePayload {
  instanceId: string;
}

export interface PromptSetPayload {
  prompt: string;
  matchedAssets: Asset[];
}

export interface SyncResponsePayload {
  requesterId: string;
  items: CanvasItem[];
  prompt: string;
  matchedAssets: Asset[];
}

export interface RequestSyncPayload {
  requesterId: string;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Asset } from "@/lib/assets";
import { CanvasItem } from "@/components/KonvaAsset";
import { getClientIdentity } from "@/lib/identity";
import {
  CursorPayload,
  ItemAddPayload,
  ItemChangePayload,
  ItemDeletePayload,
  PresenceMeta,
  PromptSetPayload,
  RequestSyncPayload,
  SyncResponsePayload,
} from "@/lib/room";

const CURSOR_THROTTLE_MS = 50;
const SYNC_TIMEOUT_MS = 1000;

export interface Peer extends PresenceMeta {
  clientId: string;
  cursor?: { x: number; y: number };
}

export function useCollabChannel(roomId: string) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [prompt, setPromptState] = useState("");
  const [matchedAssets, setMatchedAssets] = useState<Asset[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [ready, setReady] = useState(false);

  const [identity] = useState(getClientIdentity);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const itemsRef = useRef<CanvasItem[]>([]);
  const promptRef = useRef("");
  const matchedRef = useRef<Asset[]>([]);
  const syncedRef = useRef(false);
  const lastCursorSentRef = useRef(0);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { promptRef.current = prompt; }, [prompt]);
  useEffect(() => { matchedRef.current = matchedAssets; }, [matchedAssets]);

  useEffect(() => {
    syncedRef.current = false;

    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false }, presence: { key: identity.clientId } },
    });
    channelRef.current = channel;

    channel
      .on<ItemAddPayload>("broadcast", { event: "item-add" }, ({ payload }) => {
        setItems((prev) =>
          prev.some((i) => i.instanceId === payload.item.instanceId) ? prev : [...prev, payload.item]
        );
      })
      .on<ItemChangePayload>("broadcast", { event: "item-change" }, ({ payload }) => {
        setItems((prev) =>
          prev.map((i) => (i.instanceId === payload.instanceId ? { ...i, ...payload.updates } : i))
        );
      })
      .on<ItemDeletePayload>("broadcast", { event: "item-delete" }, ({ payload }) => {
        setItems((prev) => prev.filter((i) => i.instanceId !== payload.instanceId));
      })
      .on("broadcast", { event: "item-clear" }, () => {
        setItems([]);
      })
      .on<PromptSetPayload>("broadcast", { event: "prompt-set" }, ({ payload }) => {
        setPromptState(payload.prompt);
        setMatchedAssets(payload.matchedAssets);
        syncedRef.current = true;
        setReady(true);
      })
      .on<CursorPayload>("broadcast", { event: "cursor" }, ({ payload }) => {
        setPeers((prev) =>
          prev.map((p) =>
            p.clientId === payload.clientId ? { ...p, cursor: { x: payload.x, y: payload.y } } : p
          )
        );
      })
      .on<RequestSyncPayload>("broadcast", { event: "request-sync" }, ({ payload }) => {
        if (payload.requesterId === identity.clientId || !promptRef.current) return;
        const response: SyncResponsePayload = {
          requesterId: payload.requesterId,
          items: itemsRef.current,
          prompt: promptRef.current,
          matchedAssets: matchedRef.current,
        };
        channel.send({ type: "broadcast", event: "sync-response", payload: response });
      })
      .on<SyncResponsePayload>("broadcast", { event: "sync-response" }, ({ payload }) => {
        if (payload.requesterId !== identity.clientId || syncedRef.current) return;
        syncedRef.current = true;
        setItems(payload.items);
        setPromptState(payload.prompt);
        setMatchedAssets(payload.matchedAssets);
        setReady(true);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        setPeers((prev) =>
          Object.entries(state).map(([clientId, metas]) => {
            const meta = metas[0];
            const existing = prev.find((p) => p.clientId === clientId);
            return { clientId, name: meta.name, color: meta.color, cursor: existing?.cursor };
          })
        );
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        await channel.track({ name: identity.name, color: identity.color } as PresenceMeta);
        channel.send({
          type: "broadcast",
          event: "request-sync",
          payload: { requesterId: identity.clientId } as RequestSyncPayload,
        });
        setTimeout(() => {
          if (!syncedRef.current) setReady(true);
        }, SYNC_TIMEOUT_MS);
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, identity]);

  const addItem = useCallback((item: CanvasItem) => {
    setItems((prev) => [...prev, item]);
    channelRef.current?.send({ type: "broadcast", event: "item-add", payload: { item } as ItemAddPayload });
  }, []);

  const changeItem = useCallback((instanceId: string, updates: Partial<CanvasItem>) => {
    setItems((prev) => prev.map((i) => (i.instanceId === instanceId ? { ...i, ...updates } : i)));
    channelRef.current?.send({
      type: "broadcast",
      event: "item-change",
      payload: { instanceId, updates } as ItemChangePayload,
    });
  }, []);

  const deleteItem = useCallback((instanceId: string) => {
    setItems((prev) => prev.filter((i) => i.instanceId !== instanceId));
    channelRef.current?.send({
      type: "broadcast",
      event: "item-delete",
      payload: { instanceId } as ItemDeletePayload,
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
    channelRef.current?.send({ type: "broadcast", event: "item-clear", payload: {} });
  }, []);

  const setPrompt = useCallback((newPrompt: string, assets: Asset[]) => {
    setPromptState(newPrompt);
    setMatchedAssets(assets);
    syncedRef.current = true;
    channelRef.current?.send({
      type: "broadcast",
      event: "prompt-set",
      payload: { prompt: newPrompt, matchedAssets: assets } as PromptSetPayload,
    });
  }, []);

  const sendCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastCursorSentRef.current < CURSOR_THROTTLE_MS) return;
      lastCursorSentRef.current = now;
      channelRef.current?.send({
        type: "broadcast",
        event: "cursor",
        payload: { clientId: identity.clientId, name: identity.name, color: identity.color, x, y } as CursorPayload,
      });
    },
    [identity]
  );

  return {
    items,
    prompt,
    matchedAssets,
    peers,
    ready,
    myIdentity: identity,
    addItem,
    changeItem,
    deleteItem,
    clearItems,
    setPrompt,
    sendCursor,
  };
}

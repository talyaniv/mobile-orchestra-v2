import { Redis } from "@upstash/redis";
import { ClientRecord, OrchestraState } from "./types";

const STATE_KEY = "mobile-orchestra:state";
const CLIENT_PREFIX = "mobile-orchestra:client:";
const CLIENT_IDS_KEY = "mobile-orchestra:client-ids";
const TRACK_COUNT = 6;

type Store = {
  join(clientId: string): Promise<ClientRecord>;
  ready(clientId: string): Promise<ClientRecord | null>;
  getClient(clientId: string): Promise<ClientRecord | null>;
  getState(): Promise<OrchestraState>;
  start(playAt: number): Promise<OrchestraState>;
  reset(): Promise<void>;
};

const defaultState: OrchestraState = {
  nextTrackIndex: 0,
  playAt: null,
  startedAt: null,
};

function nextTrackFromIndex(index: number) {
  return (index % TRACK_COUNT) + 1;
}

function createRedisStore(): Store {
  const redis = Redis.fromEnv();

  async function getState(): Promise<OrchestraState> {
    return (await redis.get<OrchestraState>(STATE_KEY)) ?? defaultState;
  }

  return {
    async join(clientId: string) {
      const existing = await redis.get<ClientRecord>(`${CLIENT_PREFIX}${clientId}`);
      if (existing) return existing;

      const state = await getState();
      const track = nextTrackFromIndex(state.nextTrackIndex);
      const client: ClientRecord = { clientId, track, ready: false, joinedAt: Date.now() };

      await redis.set(`${CLIENT_PREFIX}${clientId}`, client);
      await redis.sadd(CLIENT_IDS_KEY, clientId);
      await redis.set(STATE_KEY, {
        ...state,
        nextTrackIndex: (state.nextTrackIndex + 1) % TRACK_COUNT,
      });

      return client;
    },

    async ready(clientId: string) {
      const client = await redis.get<ClientRecord>(`${CLIENT_PREFIX}${clientId}`);
      if (!client) return null;

      const updated = { ...client, ready: true };
      await redis.set(`${CLIENT_PREFIX}${clientId}`, updated);
      return updated;
    },

    async getClient(clientId: string) {
      return await redis.get<ClientRecord>(`${CLIENT_PREFIX}${clientId}`);
    },

    getState,

    async start(playAt: number) {
      const state = await getState();
      const updated = { ...state, playAt, startedAt: Date.now() };
      await redis.set(STATE_KEY, updated);
      return updated;
    },

    async reset() {
      const ids = await redis.smembers<string[]>(CLIENT_IDS_KEY);
      if (ids.length) await redis.del(...ids.map((id) => `${CLIENT_PREFIX}${id}`));
      await redis.del(CLIENT_IDS_KEY);
      await redis.set(STATE_KEY, defaultState);
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __mobileOrchestraMemory:
    | { state: OrchestraState; clients: Map<string, ClientRecord> }
    | undefined;
}

function createMemoryStore(): Store {
  if (!globalThis.__mobileOrchestraMemory) {
    globalThis.__mobileOrchestraMemory = {
      state: { ...defaultState },
      clients: new Map(),
    };
  }

  const memory = globalThis.__mobileOrchestraMemory;

  return {
    async join(clientId: string) {
      const existing = memory.clients.get(clientId);
      if (existing) return existing;

      const track = nextTrackFromIndex(memory.state.nextTrackIndex);
      const client: ClientRecord = { clientId, track, ready: false, joinedAt: Date.now() };

      memory.clients.set(clientId, client);
      memory.state.nextTrackIndex = (memory.state.nextTrackIndex + 1) % TRACK_COUNT;
      return client;
    },

    async ready(clientId: string) {
      const client = memory.clients.get(clientId);
      if (!client) return null;

      const updated = { ...client, ready: true };
      memory.clients.set(clientId, updated);
      return updated;
    },

    async getClient(clientId: string) {
      return memory.clients.get(clientId) ?? null;
    },

    async getState() {
      return memory.state;
    },

    async start(playAt: number) {
      memory.state.playAt = playAt;
      memory.state.startedAt = Date.now();
      return memory.state;
    },

    async reset() {
      memory.clients.clear();
      memory.state = { ...defaultState };
    },
  };
}

export const store: Store =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? createRedisStore()
    : createMemoryStore();

export type ClientRecord = {
  clientId: string;
  track: number;
  ready: boolean;
  readyAt: number | null;
  joinedAt: number;
};

export type OrchestraState = {
  nextTrackIndex: number;
  playAt: number | null;
  startedAt: number | null;
};

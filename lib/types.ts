export type ClientRecord = {
  clientId: string;
  track: number;
  ready: boolean;
  joinedAt: number;
};

export type OrchestraState = {
  nextTrackIndex: number;
  playAt: number | null;
  startedAt: number | null;
};

export type Score = {
  userName: string;
  score: number;
};

export type ResultResponse = {
  bests: Score[];
  worsts: Score[];
};
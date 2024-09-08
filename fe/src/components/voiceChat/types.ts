export enum WSResponseTypes {
  'uuid' = 'uuid',
  'offer' = 'offer',
  'answer' = 'answer',
  'iceCandidate' = 'iceCandidate',
}

export type WSResponseType = keyof typeof WSResponseTypes;

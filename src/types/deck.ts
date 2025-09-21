
export interface DeckInitResponse {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface Card {
  code: string; 
  image: string; 
  images: {
    svg: string;
    png: string;
  };
  value: string; 
  suit: string;  
}

export interface DrawCardResponse {
  success: boolean;
  cards: Card[];
  deck_id: string;
  remaining: number;
}

export type SnapType = 'VALUE' | 'SUIT' | null;

export interface GameState {
  deckId: string;
  previousCard: Card | null;
  currentCard: Card | null;
  remaining: number;
  snap: SnapType;
  valueMatches: number;
  suitMatches: number;
}

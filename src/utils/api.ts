
import type { DeckInitResponse, DrawCardResponse } from '@/types/deck';

const BASE_URL = 'https://deckofcardsapi.com/api/deck';
const TIMEOUT = 10000;


// custom error class for api errors

export class ApiError extends Error {
  public status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// helper function to perform fetch with timeout and error handling

const fetchJson = async <T>(url: string, timeoutMs = TIMEOUT): Promise<T> => {

  // sets up an abortable fetch using the abortcontroller api
  const controller = new AbortController();

  // automatically aborts the request if it exceeds timeoutMs
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new ApiError(`API request failed: ${response.statusText}`, response.status);
    }



    // parses the json response into the expected type T
    const data = await response.json();
    return data as T;


  // handles fetch aborts and other errors
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'AbortError') {
      throw new ApiError('Request timed out');
    }
    throw err instanceof ApiError ? err : new ApiError((err as Error).message);
  } finally {
    clearTimeout(timeout);
  }
};


// function to initialize a new shuffled deck

export const initDeck = async (): Promise<DeckInitResponse> => {
  const url = `${BASE_URL}/new/shuffle/?deck_count=1`;
  return fetchJson<DeckInitResponse>(url);
};

// function to draw a card from the specified deck

export const drawCard = async (deckId: string): Promise<DrawCardResponse> => {
  const url = `${BASE_URL}/${deckId}/draw/?count=1`;
  return fetchJson<DrawCardResponse>(url);
};

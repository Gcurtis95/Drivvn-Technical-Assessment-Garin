import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './../src/app/page';
import { initDeck, drawCard } from './../src/utils/api';



// Mock the API functions
jest.mock('./../src/utils/api', () => ({
  initDeck: jest.fn(),
  drawCard: jest.fn(),
}));

const mockedInitDeck = initDeck as jest.Mock;
const mockedDrawCard = drawCard as jest.Mock;

describe('SNAP Game UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  // Test 1: Initialises a shuffled single deck of cards

  test('Initialises a shuffled single deck of cards', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'test-deck', remaining: 52 });

    render(<HomePage />);
    expect(screen.getByText(/loading deck/i)).toBeInTheDocument();

    await waitFor(() => expect(mockedInitDeck).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('button', { name: /draw card/i })).toBeInTheDocument();
  });

  // Test 2: Provides a draw button and draws a card

  test('Provides a draw button and draws a card', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 52 });

    const card = {
      code: '3H',
      image: 'https://deckofcardsapi.com/static/img/3H.png',
      value: '3',
      suit: 'HEARTS',
      images: { svg: '', png: '' },
    };

    mockedDrawCard.mockResolvedValueOnce({ cards: [card], remaining: 51 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByAltText(card.code)).toBeInTheDocument());
  });


  // Test 3: Displays previous and current cards, or placeholder if no previous card

  test('Displays previous and current cards, or placeholder if no previous card', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 52 });

    const card1 = {
      code: '7D',
      image: 'https://deckofcardsapi.com/static/img/7D.png',
      value: '7',
      suit: 'DIAMONDS',
      images: { svg: '', png: '' },
    };

    const card2 = {
      code: 'QS',
      image: 'https://deckofcardsapi.com/static/img/QS.png',
      value: 'QUEEN',
      suit: 'SPADES',
      images: { svg: '', png: '' },
    };

    mockedDrawCard
      .mockResolvedValueOnce({ cards: [card1], remaining: 51 })
      .mockResolvedValueOnce({ cards: [card2], remaining: 50 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });

    // first draw
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByAltText(card1.code)).toBeInTheDocument());
    // placeholder should be visible for the previous slot
    expect(screen.getByText(/no card/i)).toBeInTheDocument();

    // second draw
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByAltText(card2.code)).toBeInTheDocument());
    // the first card should now be the previous card
    expect(screen.getByAltText(card1.code)).toBeInTheDocument();
  });


  // Test 4: Displays SNAP VALUE! if values match

  test('Displays SNAP VALUE! if values match', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 52 });

    const card1 = {
      code: '4C',
      image: 'https://deckofcardsapi.com/static/img/4C.png',
      value: '4',
      suit: 'CLUBS',
      images: { svg: '', png: '' },
    };

    const card2 = {
      code: '4S',
      image: 'https://deckofcardsapi.com/static/img/4S.png',
      value: '4',
      suit: 'SPADES',
      images: { svg: '', png: '' },
    };

    mockedDrawCard
      .mockResolvedValueOnce({ cards: [card1], remaining: 51 })
      .mockResolvedValueOnce({ cards: [card2], remaining: 50 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByAltText(card1.code)).toBeInTheDocument());

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(/snap value!/i)).toBeInTheDocument());
  });


  // Test 5: Displays SNAP SUIT! if suits match

  test('Displays SNAP SUIT! if suits match', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 52 });

    const card1 = {
      code: 'KH',
      image: 'https://deckofcardsapi.com/static/img/KH.png',
      value: 'KING',
      suit: 'HEARTS',
      images: { svg: '', png: '' },
    };

    const card2 = {
      code: '5H',
      image: 'https://deckofcardsapi.com/static/img/5H.png',
      value: '5',
      suit: 'HEARTS',
      images: { svg: '', png: '' },
    };

    mockedDrawCard
      .mockResolvedValueOnce({ cards: [card1], remaining: 51 })
      .mockResolvedValueOnce({ cards: [card2], remaining: 50 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByAltText(card1.code)).toBeInTheDocument());

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText(/snap suit!/i)).toBeInTheDocument());
  });

  // Test 6: Displays no message if neither value nor suit match

  test('Displays no message if neither value nor suit match', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 52 });

    const card1 = {
      code: '8C',
      image: 'https://deckofcardsapi.com/static/img/8C.png',
      value: '8',
      suit: 'CLUBS',
      images: { svg: '', png: '' },
    };

    const card2 = {
      code: 'KD',
      image: 'https://deckofcardsapi.com/static/img/KD.png',
      value: 'KING',
      suit: 'DIAMONDS',
      images: { svg: '', png: '' },
    };

    mockedDrawCard
      .mockResolvedValueOnce({ cards: [card1], remaining: 51 })
      .mockResolvedValueOnce({ cards: [card2], remaining: 50 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByAltText(card1.code)).toBeInTheDocument());

    fireEvent.click(button);

    await waitFor(() => {
 
      expect(screen.queryByText(/snap value!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/snap suit!/i)).not.toBeInTheDocument();
    });
  });




  // Test 7: Removes draw button and shows match stats after all 52 cards drawn

  test('Removes draw button and shows match stats after all 52 cards drawn', async () => {
    mockedInitDeck.mockResolvedValue({ deck_id: 'deck-1', remaining: 1 });

    const lastCard = {
      code: 'AS',
      image: 'https://deckofcardsapi.com/static/img/AS.png',
      value: 'ACE',
      suit: 'SPADES',
      images: { svg: '', png: '' },
    };

    mockedDrawCard.mockResolvedValueOnce({ cards: [lastCard], remaining: 0 });

    render(<HomePage />);
    const button = await screen.findByRole('button', { name: /draw card/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /draw card/i })).not.toBeInTheDocument();
      expect(screen.getByText(/value matches:/i)).toBeInTheDocument();
      expect(screen.getByText(/suit matches:/i)).toBeInTheDocument();
    });
  });
});

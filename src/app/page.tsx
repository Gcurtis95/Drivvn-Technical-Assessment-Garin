'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { GameState, SnapType} from '../types/deck';
import { initDeck, drawCard } from '../utils/api';

import styles from './page.module.css';


export default function HomePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardAnimation, setCardAnimation] = useState(false);




// initialize the deck on component mount

  useEffect(() => {

    //  async function to handle the asynchronous call (initDeck()).
    const initialise = async () => {
      try {

        // call the initDeck function to get a new shuffled deck
        const deck = await initDeck();

        // once the deck is retrieved, set the initial game state
        setGameState({
          deckId: deck.deck_id,
          previousCard: null,
          currentCard: null,
          remaining: 52,
          snap: null,
          valueMatches: 0,
          suitMatches: 0,
        });
      } catch (err) {
        console.error(err);

      }
    };

    initialise();
  }, []);



  // async function that makes an api call to the deck of cards api to draw a card from the deck

  const handleDraw = async () => {

    // exit if the game hasn’t initialised
    if (!gameState) return;
    setLoading(true);

    // triggers css animation for card draw
    setCardAnimation(true);
    setTimeout(() => setCardAnimation(false), 300);

    try {
      // calls the api using the deck id stored in state
      const response = await drawCard(gameState.deckId);

      // sets response to newCard variable
      const newCard = response.cards[0];

      let snap: SnapType = null;
      // variables to hold the updated match counts
      let valueMatches = gameState.valueMatches;
      let suitMatches = gameState.suitMatches;

      // logic to determine if the new card matches the previous card in value or suit

      if (gameState.currentCard) {
        if (newCard.value === gameState.currentCard.value) {
          snap = 'VALUE';
          valueMatches++;
        } else if (newCard.suit === gameState.currentCard.suit) {
          snap = 'SUIT';
          suitMatches++;
        }
      }

      setGameState(prev => {
        // if prev doesn't exist return null
        if (!prev) {
          return null;
        }

        // otherwise return a new updated game state object
        return {
          // keep all the previous game state properties
          ...prev,

          // update the following properties
          previousCard: prev.currentCard, 
          currentCard: newCard,           
          snap: snap,                     
          remaining: response.remaining,  
          valueMatches: valueMatches,     
          suitMatches: suitMatches        
        };
      });

    } catch (err) {
      console.error(err);

    } finally {
      setLoading(false);
    }
  };





  if (!gameState) return <div className={styles.container}>Loading deck...</div>;

  // sets individual values from gameState so they can be used more cleanly in the JSX
  const { previousCard, currentCard, snap, remaining, valueMatches, suitMatches } = gameState;


  // calculate number of cards drawn
  const totalCards = 52;
  const cardsDrawn = totalCards - remaining;

  return (
    <>
    <div className={styles.background}>
      {/* header*/}
      <div className={styles.header}>
        <span className={styles.headerTitle}>SNAP!</span>
        <p className="cardCounter"> Card {cardsDrawn} of {totalCards} </p>

        <div className={styles.headerCircles}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
      </div>

      {/* main content below the header */}
      <div className={styles.container}>

        <div className={styles.messageSlot} aria-live="polite">
          <span className={`${styles.snapText} ${snap ? styles.showSnap : ''}`}>
            {snap ? `SNAP ${snap}!` : ''}
          </span>
        </div>


        <div className={styles.cardRow}>
          {previousCard ? (
            <Image
              src={previousCard.image}
              alt={previousCard.code}
              width={170}
              height={250}
              className={`${styles.cardImage} ${cardAnimation ? styles.entering : styles.entered}`}

            />
          ) : (
            <div className={styles.cardPlaceholder}>No card</div>
          )}


          {currentCard ? (
            <Image
              src={currentCard.image}
              alt={currentCard.code}
              width={170}
              height={250}
              className={`${styles.cardImage} ${cardAnimation ? styles.entering : styles.entered}`}

            />
          ) : (
            <div className={styles.cardPlaceholder}></div>
          )}
        </div>
          {remaining > 0 ? (
          <button
            onClick={handleDraw}
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Drawing...' : 'Draw card'}
          </button>
        ) : (
          <div className={styles.stats}>
            <p>VALUE MATCHES: {valueMatches}</p>
            <p>SUIT MATCHES: {suitMatches}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

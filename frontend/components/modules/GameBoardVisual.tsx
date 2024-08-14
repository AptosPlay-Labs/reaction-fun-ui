import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
//import { useChain } from "@cosmos-kit/react";
import { CHAIN_NAME } from "../../config";
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
//import type { Player } from '../../core/ChainReactionGame';
import {
    Button,
    Text,
   // useColorModeValue
  } from '@chakra-ui/react';

import { notificateStore } from "../../store/notificateStore";
import { LoadingScreen } from "../common/LoadingScreen";
import Grid from '../common/Grid';

export function GameBoardVisual({}) {
  
  const {account } = useWallet();
  const [address, setAddress] = useState<any>(null)


  const { game, grid, currentPlayer, initializeGame, players } = useGameStore();
  const { currentRoom, isSpectator } = notificateStore();
  const { setNotifyCurrentRoom, setIsSpectator } = notificateStore();
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    setAddress(account?.address)
  }, [(account && account.address)])


  useEffect(() => {
    if (currentRoom) {
        const fetchGame = async () => {
          const gameDoc = doc(db, 'games', currentRoom);
          const docSnap = await getDoc(gameDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            initializeGame(8, 8, currentRoom, data.players);
          }
        };
        fetchGame();
      }
  }, [currentRoom, initializeGame, address]);


  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 8)}`;
  };

  const winner = players.find(player => player.winner == true);

  const closeGame = () => {
    setNotifyCurrentRoom(null);
    setIsSpectator(true);
  };

  return (
    <div>
      {loading && <LoadingScreen />}
      {winner ? (
      <Text>Ganador: {winner ? `${winner.color} [${formatAddress(winner.wallet)}]` : "En juego"}</Text>
    ) : (
        <Text>Turno de: {currentPlayer?.color} [{formatAddress(currentPlayer?.wallet)}]</Text>
      )}
      <Grid grid={grid} isBet={game && game.isBettingRoom} handleClick={() => { /* Disable interaction */ }} primaryColor="blue" />
      <Button onClick={closeGame}>Close</Button> 

    </div>
  );
}
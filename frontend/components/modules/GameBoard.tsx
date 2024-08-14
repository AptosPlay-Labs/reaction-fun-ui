import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
//import { useChain } from "@cosmos-kit/react";
//Aquí he traido el useWallet para usarlo en lugar del useChain de cosmos
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import { CHAIN_NAME } from "../../config";
import { doc, getDoc, updateDoc, Timestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Player } from '../../core/ChainReactionGame';
import {
    Button,
    Text,
    useColorModeValue
  } from '@chakra-ui/react';

import { notificateStore } from "../../store/notificateStore";
import {LoadingScreen} from "../common/LoadingScreen";
import Grid from '../common/Grid';
import { FirestoreGame } from '../../core/firebaseGame';


export function GameBoard({}) {
  const [onlyValidation, setOnlyValidation] = useState(0);
  const { game, grid, currentPlayer, initializeGame, addAtom, players } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const { connected, account } = useWallet();
  const [address, setAddress] = useState<any>(null)

  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const primaryColor = useColorModeValue("#000000", "#FFFFFF");
  const { currentRoom, isSpectator } = notificateStore();
  const { setNotifyCurrentRoom, setIsSpectator } = notificateStore();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setAddress(account?.address)
  }, [(account && account.address)])

  useEffect(() => {
    setOnlyValidation(0)
    setGameStarted(false) 
    setWaitingForOpponent(false)
    if (currentRoom) {
      
      const fetchGame = async () => {
        const gameDoc = doc(db, 'games', currentRoom);
        const docSnap = await getDoc(gameDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const winner = data.players.find((vl:any) => vl.winner===true);
          if (data.status === 'waiting' && !winner) {
            initializeGame(8, 8, currentRoom, data.players);
          } 
          if (data.status === 'live' && !winner) {
            initializeGame(8, 8, currentRoom, data.players);
          }
          if (data.status === 'completed' && winner) {
            initializeGame(8, 8, currentRoom, data.players);
          }
          
          else {
            console.log("El juego ha finalizado.");
          }
        }
      };
      fetchGame();
    }
  }, [currentRoom, initializeGame, address]);

  useEffect(() => {
    
    const timer = setInterval(() => {
      const winner = game?.players.find(player => player.winner==true);
      if (!winner && game && game.turnEndTime) {
        const timeRemaining = game.turnEndTime - Timestamp.now().toMillis();
        setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
        if (timeRemaining <= 0) {
          game.nextTurn();
          game.sync();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
    
  }, [game, address]);


  async function updatPLayer(game:FirestoreGame, isExit:Boolean){

    
    if(onlyValidation>0) return
    const winner = game?.players.find(player => player.winner==true);
    const lost = game?.players.find(player => player.winner==false);
    
    
    if( game && winner && game.status === "live" && winner?.wallet === address){
        const playerQuery = query(collection(db, 'players'), where('wallet', '==', winner?.wallet));
        const playerSnapshot = await getDocs(playerQuery);
        if(!playerSnapshot.empty){
            let playerData: any = null;
            playerSnapshot.forEach((doc) => {
                playerData = doc.data();
            });
            const playerDocRef = doc(db, 'players', playerSnapshot.docs[0].id);

            await updateDoc(playerDocRef, { winCount:playerData.winCount+1});
            setOnlyValidation(onlyValidation+1)
        }
    }
    
    if( game && winner && game.status === "live" && (lost?.wallet === address||isExit)){
      console.log("lost")
    console.log(lost?.wallet)
        const playerQuery = query(collection(db, 'players'), where('wallet', '==', lost?.wallet));
        const playerSnapshot = await getDocs(playerQuery);
        if(!playerSnapshot.empty){
            let playerData: any = null;
            playerSnapshot.forEach((doc) => {
                playerData = doc.data();
            });
            const playerDocRef = doc(db, 'players', playerSnapshot.docs[0].id);
            await updateDoc(playerDocRef, { lostCount:playerData.lostCount+1});
            setOnlyValidation(onlyValidation+1)
        }
        
    }
  }

  useEffect(() => {
    
    const winner = game?.players.find(player => player.winner==true);
    if (game && players.length >= 2 && players.every(player => player.play === true) && game.status && game.status !== "live" && !game?.turnEndTime && !winner) {
      game.turnEndTime = Timestamp.now().toMillis() + 30000; // 30 segundos en el futuro
      //console.log("ingresa en comando start to live")
      game.startGame(); // Cambiar el estado a "live"
      setGameStarted(true);
    }
  
    if (winner && game && game.status && game.status !== "completed") {
        updatPLayer(game!, false)
        game.completeGame(); // Cambiar el estado a "completed"
    }
  
    if (game && players.length >= 2 && players.every(player => player.play === true)) {
      setWaitingForOpponent(false);
      setGameStarted(true);
    } else {
      setWaitingForOpponent(true);
    }
  
    if (game) {
      let playerAddress = game.players.find(vl => vl.wallet === address);
      if (playerAddress && playerAddress.play && !winner) {
        setGameStarted(true);
      }
    }
  }, [game, players, address]);

  const startGame = async () => {
    if (game && !gameStarted && address) {
      const playerIndex = game.players.findIndex(player => player.wallet === address);
      if (playerIndex !== -1) {
        game.players[playerIndex].play = true;
        await updateDoc(game.gameDoc, { players: game.players });
        // if (game && players.length >= 2 && players.every(player => player.play === true)){
        //     setWaitingForOpponent(false);
        // }else {
        //     setWaitingForOpponent(true);
        // }
      }
    }
  };

  const handleClick = (row: number, col: number) => {
    const winner = game?.players.find(player => player.winner==true);
    if (game && !winner && address && currentPlayer?.wallet === address && players.every(player => player.play === true) && game.status && game.status === "live") {
      addAtom(row, col);
    } else {
      console.log('Not your turn, address is invalid, or game has a winner');
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 8)}`;
  };

  const winner = players.find(player => player.winner==true);

  const exitGame = async () => {
    setLoading(true)
    if (currentRoom && game) {
        const playerQuery = query(collection(db, 'players'), where('wallet', '==', address));
        const playerSnapshot = await getDocs(playerQuery);
        let playerData: any = null;
        playerSnapshot.forEach((doc) => {
            playerData = doc.data();
        });
        const playerDocRef = doc(db, 'players', playerSnapshot.docs[0].id);
        await updateDoc(playerDocRef, { actualRoom: "" });

        const winner = game.players.find((vl:any) => vl.winner===true);
        if(!winner && game.status === "live"){
            game.players.map(vl=>{
                if(address !== vl.wallet){
                    vl.winner = true    
                }
                return vl
            })
            await updatPLayer(game, true)
            await updateDoc(game.gameDoc, { players: game.players, status: "completed" });
            
        }if ( game.status === "waiting") {
            //revisar en caso sea mas de 2 jugadores, aqui solo se esta mateneindo los jugadores que se queden en el juego
            let playerList = game.players.filter(vl => vl.wallet !== address);
            let playerAddress = playerList.map(player => player.wallet) //aqui que retorno ["",""] los adres asi
            let currentPlayerWallet = playerAddress.length>0 ?playerAddress[0]:""
            await updateDoc(game.gameDoc, {
                currentPlayerWallet: currentPlayerWallet,
                players: playerList,
                playersWallets: playerAddress
            });
        } else{
            await updateDoc(game.gameDoc, { status: "completed" });
        }
        
        setNotifyCurrentRoom(null);
        setIsSpectator(true);
    }
    setLoading(false)
  };

  return (
    <div>
      {loading && <LoadingScreen />} 

      {winner ? (
        <Text>Ganador: {winner.color} [{formatAddress(winner.wallet)}]</Text>
      ) : (
        <div>
           <Button onClick={startGame} disabled={gameStarted}>Iniciar Juego</Button> 
          {gameStarted && (
                <div>
                    {waitingForOpponent && <Text>Esperando que el otro jugador esté listo...</Text>}    
                </div>
          )}
          <Text>Turno de: {currentPlayer?.color} [{formatAddress(currentPlayer?.wallet)}]</Text>
          <div>
            {timeLeft !== null && <Text>Tiempo restante: {Math.ceil(timeLeft / 1000)}s</Text>}
            <progress value={timeLeft ? (30000 - timeLeft) : 0} max="30000" />
          </div>
        </div>
      )}

      {/* <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell.player?.color}`}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                <Text color={primaryColor}>{cell.count}</Text> 
              </div>
            ))}
          </div>
        ))}
      </div> */}
    
    <Grid grid={grid} isBet={game && game.isBettingRoom} handleClick={handleClick} primaryColor="blue" />        

      {!isSpectator && (<Button onClick={exitGame}>Exit</Button>)}
      
    </div>
  );
}

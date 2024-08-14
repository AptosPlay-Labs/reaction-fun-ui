import React, { useEffect, useState } from 'react';
import { BettingGames, NonBettingGames, MyGames, GameRoom } from '../../core/FirestoreGameRoom';
import { FirestorePlayers, Player } from '../../core/FirestorePlayers';
import { Box, Tabs, TabList, TabPanel, TabPanels, VStack, Tab, Button, Grid } from '@chakra-ui/react';
//import { CHAIN_NAME } from '../../config';
import { Text, useColorModeValue } from '@chakra-ui/react';
import { db } from '../../config/firebase';
import { addDoc, collection, updateDoc, doc, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
// import { useChain } from '@cosmos-kit/react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { notificateStore } from '../../store/notificateStore';
import { LoadingScreen } from "../common/LoadingScreen";

export function GameRooms({}) {
  const [roomsNoBet, setRoomsNoBet] = useState<GameRoom[]>([]);
  const [roomsBet, setRoomsBet] = useState<GameRoom[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [myGames, setMyGames] = useState<any[]>([]); // Add state for MyGames
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const primaryColor = useColorModeValue("#000000", "#FFFFFF");
  // const { status, address } = useChain(chainName);
  const { connected, account } = useWallet();
  const [address, setAddress] = useState<any>(null)
  const { setNotifyCurrentRoom, setIsSpectator } = notificateStore();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setAddress(account?.address)
  }, [connected, (account && account.address)])

  useEffect(() => {
    // [1,2,3,4,5,6,7,8].map(vl=>{
    //   createNewGameRoom()
    // })
    setLoading(true);
    const nonBettingGames = new NonBettingGames();
    nonBettingGames.onSnapshot((updatedRooms) => {
        setRoomsNoBet(updatedRooms);
    });

    const bettingGames = new BettingGames();
    bettingGames.onSnapshot((updatedRooms) => {
        setRoomsBet(updatedRooms);
    });

    const firestorePlayers = new FirestorePlayers();
    firestorePlayers.onSnapshot((players) => {
      setTopPlayers(players);
    });

    if (address) {
        const firestoreMyGames = new MyGames(address); // Initialize MyGames
        firestoreMyGames.onSnapshot((games) => {
        setMyGames(games);
        });
    }
    
    async function checkCurrentRoom() {
      setCurrentRoom(null);
      if (address) {
        const q = query(collection(db, 'players'), where('wallet', '==', address));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const playersCollection = collection(db, 'players');
          const newPlayer = {
            actualRoom: "",
            lostAmount: 0,
            lostCount: 0,
            wallet: address,
            winAmount: 0,
            winCount: 0
          };

          try {
            const docRef = await addDoc(playersCollection, newPlayer);
            console.log('Document created with ID:', docRef.id);
          } catch (error) {
            console.error("Error creating new player: ", error);
          }
        }

        const gameQuery = query(collection(db, 'games'),
          where('playersWallets', 'array-contains', address),
          where('status', 'in', ['live', 'waiting']),
          orderBy('createRoomTime', 'desc'));

        const gameSnapshot = await getDocs(gameQuery);

        if (!gameSnapshot.empty) {
          gameSnapshot.forEach((doc_game) => {
            const gameData = doc_game.data();
            if (gameData.players.some((player: Player) => player.wallet === address)) {
              querySnapshot.forEach((vl) => {
                const playerData = vl.data();
                if (playerData.actualRoom && playerData.actualRoom === doc_game.id) {
                  setCurrentRoom(playerData.actualRoom);
                  setNotifyCurrentRoom(playerData.actualRoom);
                  setIsSpectator(false);
                }
              });
            }
          });
        } else {
          if (!querySnapshot.empty) {
            await querySnapshot.forEach(async (doc_players) => {
              const playerData = doc_players.data();
              if (playerData.actualRoom && playerData.actualRoom !== "") {
                const playerDocRef = doc(db, 'players', doc_players.id);
                await updateDoc(playerDocRef, { actualRoom: "" });
              }
            });
          }

          setCurrentRoom(null);
        //   if (rooms.length > 0 && rooms[0].status === 'live') {
        //     setNotifyCurrentRoom(rooms[0].id);
        //   }
          setIsSpectator(true);
        }

      } else {
        setCurrentRoom(null);
        // if (rooms.length > 0 && rooms[0].status === 'live') {
        //   setNotifyCurrentRoom(rooms[0].id);
        // }
        setIsSpectator(true);
      }
      setLoading(false);
    }

    checkCurrentRoom();
  }, [address]);

  async function joinGame(room: GameRoom) {
    setLoading(true);
    if (!address) {
      alert('Please connect your wallet to proceed.');
      setLoading(false);
      return;
    }

    const playerQuery = query(collection(db, 'players'), where('wallet', '==', address));
    const playerSnapshot = await getDocs(playerQuery);
    let playerData: any = null;
    playerSnapshot.forEach((doc) => {
      playerData = doc.data();
    });

    const gameQuery = query(collection(db, 'games'),
      where('playersWallets', 'array-contains', address),
      where('status', '==', 'waiting'),
      orderBy('createRoomTime', 'desc'));

    const gameSnapshot = await getDocs(gameQuery);
    let existingGame: any = null;
    gameSnapshot.forEach((doc) => {
      existingGame = doc.data();
      existingGame.id = doc.id;
    });

    if ((playerData && playerData.actualRoom && playerData.actualRoom) ||
      (existingGame && existingGame.id)) {
      alert('You are already in another room.');
      return;
    }

    if (room.players.length < room.totalPlayers && room.grid === "") {
      const gameDocRef = doc(db, 'games', room.id);
      const newPlayer = {
        color: room.players.length === 0 ? 'red' : 'blue',
        moves: 0,
        play: false,
        wallet: address,
        winner: false,
      };
      let newCurrentplayer = (existingGame && existingGame.currentPlayerWallet && (existingGame.currentPlayerWallet !== "")) ? existingGame.currentPlayerWallet : address;

      //esto uede generar error en caso se unan 2 usuarios al mismo tiempo.
      await updateDoc(gameDocRef, { players: [...room.players, newPlayer],
        playersWallets: [...room.playersWallets, address],
        currentPlayerWallet: newCurrentplayer });

      if (playerData) {
        const playerDocRef = doc(db, 'players', playerSnapshot.docs[0].id);
        await updateDoc(playerDocRef, { actualRoom: room.id });
      }

      setCurrentRoom(room.id);
      setNotifyCurrentRoom(room.id);
      setIsSpectator(false);
    } else {
      alert('Unable to join this room.');
    }
    setLoading(false);
  }

  async function createNewGameRoom() {
    if (!address) {
      alert('Player address not found.');
      return;
    }

    const initialData = {
      currentPlayerWallet: "",//address,
      grid: "",
      players: [
        // {
        //   color: "red",
        //   moves: 0,
        //   play: false,
        //   wallet: address,
        //   winner: false
        // }
      ],
      playersWallets:[],
      totalPlayers: 2,
      isBettingRoom: true,
      createRoomTime: Timestamp.now(),
      status:"waiting"
    };

    try {
      const gameRoomsCollection = collection(db, 'games');
      const docRef = await addDoc(gameRoomsCollection, initialData);
      const newDocId = docRef.id;
    } catch (error) {
      console.error("Error creating new game room: ", error);
    }
  }

  async function viewGamePlay(room_id: any) {
    setLoading(true);
    setNotifyCurrentRoom(room_id);
    setIsSpectator(true);
    setLoading(false);
  }

  return (
    <Tabs isFitted variant='enclosed' color={primaryColor} minWidth="650px">
      {loading && <LoadingScreen />}
      <TabList mb='1em'>
        <Tab _selected={{ color: 'white', bg: 'green.400' }}>
        Modo de entrenamiento
        </Tab>
        <Tab _selected={{ color: 'white', bg: 'green.400' }}>
          Challenge Mode
        </Tab>
        <Tab _selected={{ color: 'white', bg: 'green.400' }}>
          My Wins
        </Tab>
        <Tab _selected={{ color: 'white', bg: 'green.400' }}>
          Top Players
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div style={{ maxHeight: '420px', minWidth: "450px", paddingRight: "10px", overflowY: 'auto' }}>
            <VStack spacing={8} align="stretch">
              {roomsNoBet.filter(room => !room.isBettingRoom).map((room, index) => (
                <Box
                  key={room.id}
                  border="solid 1px #00ff54"
                  color= "#000"
                  borderRadius="20px"
                  overflow="hidden"
                  p="1"
                  boxShadow="md"
                >
                  <Text fontSize='x-large'>Game Room: #{index + 1}</Text>
                  <Text>Id: {room.id}</Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    <Text>Players: {room.totalPlayers}</Text>
                    <Text>Game Started: {room.grid !== "" ? "Yes" : "No"}</Text>
                    <Text>Players Needed: {room.totalPlayers - room.players.length}</Text>
                    <Text>Game Ended: {room.winnerWallet ? "Yes" : "No"}</Text>
                    {room.winnerWallet && <Text>Winner: {room.winnerWallet}</Text>}
                  </Grid>
                  {room.grid === "" && room.players.length < room.totalPlayers && (
                    <Button
                      onClick={() => joinGame(room)}
                      isDisabled={currentRoom}
                      w="120px"
                    >
                      Join
                    </Button>
                  )}
                  {room.grid !== "" && (
                    <Button onClick={() => { viewGamePlay(room.id) }}>View Game</Button>
                  )}
                  {room.grid === "" && !room.turnEndTime && room.players.length === room.totalPlayers && (
                    <Text>Pending Start...</Text>
                  )}
                </Box>
              ))}
            </VStack>
          </div>
        </TabPanel>
        <TabPanel>
          <div style={{ maxHeight: '420px', minWidth: "450px", paddingRight: "10px", overflowY: 'auto' }}>
            <VStack spacing={8} align="stretch">
              {roomsBet.filter(room => room.isBettingRoom).map((room, index) => (
                <Box
                  key={room.id}
                  border="solid 1px #00ff54"
                  borderRadius="20px"
                  overflow="hidden"
                  p="1"
                  boxShadow="md"
                >
                  <Text fontSize='x-large'>Game Room: #{index + 1}</Text>
                  <Text>Id: {room.id}</Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    <Text>Players: {room.totalPlayers}</Text>
                    <Text>Game Started: {room.grid !== "" ? "Yes" : "No"}</Text>
                    <Text>Players Needed: {room.totalPlayers - room.players.length}</Text>
                    <Text>Game Ended: {room.winnerWallet ? "Yes" : "No"}</Text>
                    {room.winnerWallet && <Text>Winner: {room.winnerWallet}</Text>}
                  </Grid>
                  {room.grid === "" && room.players.length < room.totalPlayers && (
                    <Button
                      onClick={() => joinGame(room)}
                      isDisabled={currentRoom}
                      w="120px"
                    >
                      Join
                    </Button>
                  )}
                  {room.grid !== "" && (
                    <Button onClick={() => { viewGamePlay(room.id) }}>View Game</Button>
                  )}
                  {room.grid === "" && !room.turnEndTime && room.players.length === room.totalPlayers && (
                    <Text>Pending Start...</Text>
                  )}
                </Box>
              ))}
            </VStack>
          </div>
        </TabPanel>
        <TabPanel>
          <div style={{ maxHeight: '420px', minWidth: "450px", paddingRight: "10px", overflowY: 'auto' }}>
            <VStack spacing={8} align="stretch">
              {myGames.map((game, index) => (
                <Box
                  key={game.id}
                  border="solid 1px #00ff54"
                  borderRadius="20px"
                  overflow="hidden"
                  p="1"
                  boxShadow="md"
                >
                  <Text fontSize='x-large'>Game Room: #{index + 1}</Text>
                  <Text>Id: {game.id}</Text>
                  <Text>Status: {game.status}</Text>
                  <Text>Winner: {game.winnerWallet || "N/A"}</Text>
                  <Text>Players: {game.players.length}</Text>
                  <Text>Game Started: {game.grid !== "" ? "Yes" : "No"}</Text>
                  {game.winnerWallet === address ? (
                    <Text fontWeight="bold" color="green.500">You Won!</Text>
                  ):(
                    <Text fontWeight="bold" color="green.500">You Lost!</Text>
                  )}
                </Box>
              ))}
            </VStack>
          </div>
        </TabPanel>
        <TabPanel>
          <div style={{ maxHeight: '420px', minWidth: "450px", paddingRight: "10px", overflowY: 'auto' }}>
            <VStack spacing={8} align="stretch">
              {topPlayers.map((player, index) => (
                <Box
                  key={player.wallet}
                  border="solid 1px #00ff54"
                  borderRadius="20px"
                  overflow="hidden"
                  p="1"
                  boxShadow="md"
                >
                  <Text fontSize='x-large'>Player #{index + 1}</Text>
                  <Text>Wallet: {player.wallet}</Text>
                  <Text>Wins: {player.winCount}</Text>
                  <Text>Lost: {player.lostCount}</Text>
                  {/* <Text>Total Won: {player.winAmount}</Text> */}
                </Box>
              ))}
            </VStack>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

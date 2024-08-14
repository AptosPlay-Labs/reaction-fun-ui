// core/firebaseGame.ts
import { db } from '../config/firebase';
import { Timestamp } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ChainReactionGame, Cell, Player } from './ChainReactionGame';

class FirestoreGame extends ChainReactionGame {
  gameDoc: any;
  private onSnapshotCallback: ((grid: Cell[][], currentPlayer: Player, status: string) => void) | null = null;
  status: any;

  constructor(rows: number, cols: number, gameId: string, players: Player[]) {
    super(rows, cols, players);
    this.gameDoc = doc(db, 'games', gameId);
    this.status = null;

    onSnapshot(this.gameDoc, (snapshot: any) => {
      const data = snapshot.data();
      if (data.grid !== "") {
        const parsedGrid = JSON.parse(data.grid) as Cell[][];
        this.grid = parsedGrid;
        this.isBettingRoom = data.isBettingRoom;
        this.currentPlayerWallet = data.currentPlayerWallet;
        this.turnEndTime = data.turnEndTime ? data.turnEndTime.toMillis() : null;
        this.players = data.players;
        this.status = data.status;
        if (this.onSnapshotCallback) {
          this.onSnapshotCallback(this.grid, this.currentPlayer, this.status);
        }
      } else {
        if (this.onSnapshotCallback) {
          this.currentPlayerWallet = data.currentPlayerWallet;
          this.turnEndTime = data.turnEndTime ? data.turnEndTime.toMillis() : null;
          this.players = data.players;
          this.status = data.status;
          let grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({ player: null, count: 0 }))
          );
          this.onSnapshotCallback(grid, data.players[0], data.status);
        }
      }
    });
  }

  onSnapshot(callback: (grid: Cell[][], currentPlayer: Player, status: string) => void) {
    this.onSnapshotCallback = callback;
  }

  async sync() {
    await updateDoc(this.gameDoc, {
      grid: JSON.stringify(this.grid),
      currentPlayerWallet: this.currentPlayerWallet,
      turnEndTime: this.turnEndTime ? Timestamp.fromMillis(this.turnEndTime) : null,
      players: this.players,
      status: this.status // Actualizar status en Firestore
    });
  }

  addAtom(row: number, col: number) {
    //console.log(" add atom")
    super.addAtom(row, col);
    this.checkWinner();
    this.sync();
  }

  startGame() {
    //console.log(" status live")
    this.status = 'live';
    this.sync();
  }

  completeGame() {
    //console.log(" status completed")
    this.status = 'completed';
    this.sync();
  }
}

export { FirestoreGame };
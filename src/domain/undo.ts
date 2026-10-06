import { decodeState, type KitchenState } from './kitchen';
export class KitchenUndo {
  private snapshots: KitchenState[] = [];
  get size() { return this.snapshots.length; }
  capture(state: KitchenState) {
    this.snapshots = [...this.snapshots.slice(-4), decodeState(JSON.stringify(state))];
  }
  take(): KitchenState | undefined { return this.snapshots.pop(); }
  clear() { this.snapshots = []; }
}

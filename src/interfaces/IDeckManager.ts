export interface IDeckManager {
  readonly position: { x: number; y: number };
  createDeckVisual(): void;
}

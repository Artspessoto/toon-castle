import Phaser from "phaser";
import type { GameEventMap } from "./GameEvents";

class TypedEventBus extends Phaser.Events.EventEmitter {
  public emit<K extends keyof GameEventMap>(
    event: K,
    payload: GameEventMap[K],
  ): boolean {
    if (
      process.env.NODE_ENV == "development" ||
      process.env.NODE_ENV == "test"
    ) {
      console.log(
        `%c[EVENT]%c ${event}%c`,
        "color: #00ff00; font-weight: bold; background: #111; padding: 2px 5px; border-radius: 3px 0 0 3px;",
        "color: #fff; background: #333; padding: 2px 5px; border-radius: 0 3px 3px 0;",
        "color: #aaa; margin-left: 10px;",
        payload,
      );
    }

    return super.emit(event, payload);
  }

  public on<K extends keyof GameEventMap>(
    event: K,
    fn: (payload: GameEventMap[K]) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any,
  ): this {
    return super.on(event, fn, context);
  }
}

export const EventBus = new TypedEventBus();

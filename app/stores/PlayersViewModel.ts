export class PlayersViewModel extends EventTarget {
  players: string[] = [];

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  load(players: string[]): void {
    this.players = players;
    this.emit();
  }

  addPlayer(name: string): void {
    const trimmed = name.trim();
    if (trimmed && !this.players.includes(trimmed)) {
      this.players.push(trimmed);
      this.emit();
    }
  }

  reset(): void {
    this.players = [];
    this.emit();
  }

  private emit() {
    this.saveToLocalStorage();
    this.dispatchEvent(new Event("change"));
  }

  reload(): void {
    this.loadFromLocalStorage();
    this.emit();
  }

  private loadFromLocalStorage(): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const storedPlayers = localStorage.getItem("timeline_players");
        if (storedPlayers) {
          this.players = JSON.parse(storedPlayers);
        } else {
          this.players = [];
          this.saveToLocalStorage();
        }
      } catch (e) {
        console.error("Failed to load players from localStorage", e);
      }
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("timeline_players", JSON.stringify(this.players));
      } catch (e) {
        console.error("Failed to save players to localStorage", e);
      }
    }
  }
}

export class LocationsViewModel extends EventTarget {
  locations: string[] = [];

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  load(locations: string[]): void {
    this.locations = locations;
    this.emit();
  }

  addLocation(name: string): void {
    const trimmed = name.trim();
    if (trimmed && !this.locations.includes(trimmed)) {
      this.locations.push(trimmed);
      this.emit();
    }
  }

  reset(): void {
    this.locations = [];
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
        const stored = localStorage.getItem("timeline_locations");
        if (stored) {
          this.locations = JSON.parse(stored);
        } else {
          this.locations = [];
          this.saveToLocalStorage();
        }
      } catch (e) {
        console.error("Failed to load locations from localStorage", e);
      }
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(
          "timeline_locations",
          JSON.stringify(this.locations),
        );
      } catch (e) {
        console.error("Failed to save locations to localStorage", e);
      }
    }
  }
}

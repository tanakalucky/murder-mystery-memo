export class TimesViewModel extends EventTarget {
  times: string[] = [];

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  load(times: string[]): void {
    this.times = times;
    this.emit();
  }

  addTime(name: string): void {
    const trimmed = name.trim();
    if (trimmed && !this.times.includes(trimmed)) {
      this.times.push(trimmed);
      this.times.sort((a, b) => a.localeCompare(b));
      this.emit();
    }
  }

  reset(): void {
    this.times = [];
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
        const stored = localStorage.getItem("timeline_times");
        if (stored) {
          this.times = JSON.parse(stored);
        } else {
          this.times = [];
          this.saveToLocalStorage();
        }
      } catch (e) {
        console.error("Failed to load times from localStorage", e);
      }
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("timeline_times", JSON.stringify(this.times));
      } catch (e) {
        console.error("Failed to save times to localStorage", e);
      }
    }
  }
}

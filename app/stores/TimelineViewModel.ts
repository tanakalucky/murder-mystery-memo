export interface TimelineEvent {
  playerCharacter?: string;
  time?: string;
  location?: string;
  body: string;
}

export class TimelineViewModel extends EventTarget {
  events: TimelineEvent[] = [];

  constructor() {
    super();
    this.loadFromLocalStorage();
  }

  load(events: TimelineEvent[]): void {
    this.events = events;
    this.emit();
  }

  addEvent(text: string): TimelineEvent {
    const event = this.textToEvent(text);
    this.events.push(event);

    this.emit();
    return event;
  }

  /**
   *　入力文字列からprefixを用いて、人物と場所、時間を抽出し、構造化データへ変換する。
   * 抽出した上記属性は本文から削除し、その他の部分を本文として扱う
   * @param text
   * @returns
   */
  private textToEvent(text: string): TimelineEvent {
    const words = text.split(/\s+/);

    let body = "";
    let playerCharacter: string | undefined;
    let location: string | undefined;
    let time: string | undefined;

    for (const word of words) {
      if (word.startsWith("@")) {
        playerCharacter = word.slice(1);
        continue;
      }

      if (word.startsWith("#")) {
        location = word.slice(1);
        continue;
      }

      if (word.startsWith(">")) {
        time = word.slice(1);
        continue;
      }

      if (body) {
        body += " ";
      }

      body += word;
    }

    return {
      body,
      playerCharacter,
      location,
      time,
    };
  }

  deleteAllEvents(): void {
    this.events = [];

    this.emit();
  }

  get timeline(): TimelineEvent[] {
    return this.events;
  }

  get sortedTimeline(): TimelineEvent[] {
    return this.events.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }

      return 0;
    });
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
        const storedEvents = localStorage.getItem("timeline");
        if (storedEvents) {
          this.events = JSON.parse(storedEvents);
        }
      } catch (e) {
        console.error("Failed to load data from localStorage", e);
      }
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        if (this.events.length === 0) {
          localStorage.removeItem("timeline");
        } else {
          localStorage.setItem("timeline", JSON.stringify(this.events));
        }
      } catch (e) {
        console.error("Failed to save data to localStorage", e);
      }
    }
  }
}

import { clientEntry, css, on, ref, type Handle } from "remix/ui";
import { Button } from "remix/ui/button";
import { TimelineViewModel } from "../../stores/TimelineViewModel.ts";
import { PlayersViewModel } from "../../stores/PlayersViewModel.ts";
import { LocationsViewModel } from "../../stores/LocationsViewModel.ts";
import { TimesViewModel } from "../../stores/TimesViewModel.ts";
import { getTextAreaCaretCoordinates } from "../textarea-caret.ts";
import { MemoList } from "./MemoList.tsx";

const FONT_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

export const Memo = clientEntry(
  import.meta.url,

  function Memo(handle: Handle) {
    let textareaEl: HTMLTextAreaElement | null = null;
    let containerEl: HTMLDivElement | null = null;

    const vm = new TimelineViewModel();
    const playersVm = new PlayersViewModel();
    const locationsVm = new LocationsViewModel();
    const timesVm = new TimesViewModel();

    vm.addEventListener("change", () => {
      handle.update();
    });

    playersVm.addEventListener("change", () => {
      handle.update();
    });

    locationsVm.addEventListener("change", () => {
      handle.update();
    });

    timesVm.addEventListener("change", () => {
      handle.update();
    });

    let menuType: "player" | "time" | "location" | null = null;
    let menuCoords = { top: 0, left: 0 };
    let activeIndex = 0;
    let query = "";

    // 入力されたプレイヤー名をテキストエリアに挿入する
    const insertPlayer = (playerName: string) => {
      if (!textareaEl) return;

      const text = textareaEl.value;
      const cursorPosition = textareaEl.selectionStart;
      const textBeforeCursor = text.slice(0, cursorPosition);
      const match = textBeforeCursor.match(/@([^\s@]*)$/);

      if (!match) return;

      const matchIndex = match.index!;
      const textAfterCursor = text.slice(cursorPosition);

      const newValue =
        text.slice(0, matchIndex) + `@${playerName} ` + textAfterCursor;
      textareaEl.value = newValue;

      const newCursorPos = matchIndex + playerName.length + 2; // `@` + playerName + ` `
      textareaEl.focus();
      textareaEl.setSelectionRange(newCursorPos, newCursorPos);

      menuType = null;
      handle.update();
    };

    // 入力された時間をテキストエリアに挿入する
    const insertTime = (timeStr: string) => {
      if (!textareaEl) return;

      const text = textareaEl.value;
      const cursorPosition = textareaEl.selectionStart;
      const textBeforeCursor = text.slice(0, cursorPosition);
      const match = textBeforeCursor.match(/>([^\s>]*)$/);

      if (!match) return;

      const matchIndex = match.index!;
      const textAfterCursor = text.slice(cursorPosition);

      const newValue =
        text.slice(0, matchIndex) + `>${timeStr} ` + textAfterCursor;
      textareaEl.value = newValue;

      const newCursorPos = matchIndex + timeStr.length + 2; // `>` + timeStr + ` `
      textareaEl.focus();
      textareaEl.setSelectionRange(newCursorPos, newCursorPos);

      menuType = null;
      handle.update();
    };

    // 入力された場所名をテキストエリアに挿入する
    const insertLocation = (locationName: string) => {
      if (!textareaEl) return;

      const text = textareaEl.value;
      const cursorPosition = textareaEl.selectionStart;
      const textBeforeCursor = text.slice(0, cursorPosition);
      const match = textBeforeCursor.match(/#([^\s#]*)$/);

      if (!match) return;

      const matchIndex = match.index!;
      const textAfterCursor = text.slice(cursorPosition);

      const newValue =
        text.slice(0, matchIndex) + `#${locationName} ` + textAfterCursor;
      textareaEl.value = newValue;

      const newCursorPos = matchIndex + locationName.length + 2; // `#` + locationName + ` `
      textareaEl.focus();
      textareaEl.setSelectionRange(newCursorPos, newCursorPos);

      menuType = null;
      handle.update();
    };

    const submitEvent = () => {
      if (textareaEl) {
        const text = textareaEl.value;
        const trimmed = text.trim();

        if (trimmed) {
          // Add to timeline view model (this parses playerCharacter, time, location, body and saves to localStorage)
          const event = vm.addEvent(trimmed);

          // If a new player is typed, automatically add it to PlayersViewModel
          if (event.playerCharacter) {
            playersVm.addPlayer(event.playerCharacter);
          }

          // If a new location is typed, automatically add it to LocationsViewModel
          if (event.location) {
            locationsVm.addLocation(event.location);
          }

          // If a new time is typed, automatically add it to TimesViewModel
          if (event.time) {
            timesVm.addTime(event.time);
          }
        }

        textareaEl.value = "";
        menuType = null;
        handle.update();
      }
    };

    return () => {
      const currentPlayers = playersVm.players || [];
      const currentTimes = timesVm.times || [];
      const currentLocations = locationsVm.locations || [];

      let filteredSuggestions: string[] = [];
      if (menuType === "player") {
        filteredSuggestions = currentPlayers.filter((player) =>
          player?.toLowerCase().includes(query.toLowerCase()),
        );
      } else if (menuType === "time") {
        filteredSuggestions = currentTimes.filter((time) =>
          time?.toLowerCase().includes(query.toLowerCase()),
        );
      } else if (menuType === "location") {
        filteredSuggestions = currentLocations.filter((loc) =>
          loc?.toLowerCase().includes(query.toLowerCase()),
        );
      }

      const showDropdown = menuType !== null && filteredSuggestions.length > 0;

      return (
        <div
          mix={css({
            "--surface-0": "#dee2e6",
            "--surface-3": "#f0f4f7",
            "--surface-4": "#f7fbff",
            "--text-primary": "#313539",
            "--text-tertiary": "#94989c",
            "@media (prefers-color-scheme: dark)": {
              "--surface-0": "#1e2226",
              "--surface-3": "#313539",
              "--surface-4": "#363a3e",
              "--text-primary": "#dee2e6",
              "--text-tertiary": "#94989c",
            },
            "& *, & *::before, & *::after": { boxSizing: "border-box" },
            margin: 0,
            padding: "48px 24px",
            color: "var(--text-primary)",
            fontFamily: FONT_STACK,
            fontSize: "14px",
            lineHeight: 1.5,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            boxSizing: "border-box",
            "@media (max-width: 767px)": {
              padding: "24px 16px",
            },
          })}
        >
          <div
            mix={css({
              width: "100%",
              boxSizing: "border-box",
            })}
          >
              <div
                mix={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                })}
              >
                <div
                  mix={css({
                    display: "flex",
                    gap: "1rem",
                  })}
                >
                  <Button
                    mix={[
                      buttonStyle,
                      on("click", () => {
                        vm.deleteAllEvents();
                        playersVm.reset();
                        locationsVm.reset();
                        timesVm.reset();
                        handle.update();
                      }),
                    ]}
                  >
                    Delete All Events
                  </Button>
                </div>

                <MemoList events={vm.events} />

                <div
                  mix={[
                    css({
                      position: "relative",
                    }),
                    ref((el) => {
                      containerEl = el as HTMLDivElement;
                    }),
                  ]}
                >
                  <textarea
                    placeholder="メモを入力してください... (例: @探偵 #食堂 >10:00 アリバイ確認)"
                    mix={[
                      css({
                        minHeight: "5rem",
                        padding: "12px",
                        border: "1px solid var(--surface-3)",
                        borderRadius: "8px",
                        background: "var(--surface-4)",
                        color: "var(--text-primary)",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontFamily: FONT_STACK,
                        width: "100%",
                        lineHeight: 1.6,
                        boxSizing: "border-box",
                        resize: "vertical",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        "&:focus": {
                          borderColor: "var(--accent-color)",
                          boxShadow: "0 0 0 2px rgba(45, 172, 249, 0.2)",
                        },
                      }),
                      ref((el) => {
                        textareaEl = el as HTMLTextAreaElement;
                      }),
                      on("input", () => {
                        if (!textareaEl) return;
                        const text = textareaEl.value;
                        const cursorPosition = textareaEl.selectionStart;

                        const textBeforeCursor = text.slice(0, cursorPosition);
                        const playerMatch =
                          textBeforeCursor.match(/@([^\s@]*)$/);
                        const timeMatch = textBeforeCursor.match(/>([^\s>]*)$/);
                        const locationMatch =
                          textBeforeCursor.match(/#([^\s#]*)$/);

                        let matched = false;
                        if (playerMatch) {
                          menuType = "player";
                          query = playerMatch[1];
                          matched = true;
                        } else if (timeMatch) {
                          menuType = "time";
                          query = timeMatch[1];
                          matched = true;
                        } else if (locationMatch) {
                          menuType = "location";
                          query = locationMatch[1];
                          matched = true;
                        }

                        if (matched) {
                          if (containerEl) {
                            const containerRect =
                              containerEl.getBoundingClientRect();

                            const caretCoords = getTextAreaCaretCoordinates(
                              textareaEl,
                              cursorPosition,
                            );

                            menuCoords = {
                              top: caretCoords.top - containerRect.top,
                              left: caretCoords.left - containerRect.left,
                            };
                          }

                          activeIndex = 0;
                          handle.update();
                        } else {
                          menuType = null;
                          handle.update();
                        }
                      }),
                      on("keydown", (event) => {
                        // IMEの時は無視する
                        if (event.isComposing) return;

                        if (showDropdown) {
                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            activeIndex =
                              (activeIndex + 1) % filteredSuggestions.length;
                            handle.update();
                          } else if (event.key === "ArrowUp") {
                            event.preventDefault();
                            activeIndex =
                              (activeIndex - 1 + filteredSuggestions.length) %
                              filteredSuggestions.length;
                            handle.update();
                          } else if (
                            event.key === "Enter" ||
                            event.key === "Tab"
                          ) {
                            event.preventDefault();
                            if (filteredSuggestions[activeIndex]) {
                              if (menuType === "player") {
                                insertPlayer(filteredSuggestions[activeIndex]);
                              } else if (menuType === "time") {
                                insertTime(filteredSuggestions[activeIndex]);
                              } else if (menuType === "location") {
                                insertLocation(
                                  filteredSuggestions[activeIndex],
                                );
                              }
                            }
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            menuType = null;
                            handle.update();
                          }
                        } else {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            submitEvent();
                          }
                        }
                      }),
                    ]}
                  ></textarea>

                  {showDropdown && (
                    <ul
                      style={{
                        position: "absolute",
                        top: `${menuCoords.top + 4}px`,
                        left: `${menuCoords.left}px`,
                        border: "1px solid var(--surface-3)",
                        background: "var(--surface-4)",
                        margin: 0,
                        padding: "4px",
                        listStyle: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: "120px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredSuggestions.map((item, idx) => (
                        <li
                          key={item}
                          style={{
                            padding: "6px 12px",
                            cursor: "pointer",
                            background:
                              idx === activeIndex
                                ? "var(--surface-3)"
                                : "transparent",
                            color:
                              idx === activeIndex
                                ? "var(--accent-color)"
                                : "var(--text-primary)",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                            transition: "background-color 100ms",
                          }}
                          mix={[
                            on("mousedown", (e) => {
                              e.preventDefault();
                              if (menuType === "player") {
                                insertPlayer(item);
                              } else if (menuType === "time") {
                                insertTime(item);
                              } else if (menuType === "location") {
                                insertLocation(item);
                              }
                            }),
                          ]}
                        >
                          {menuType === "player"
                            ? `@${item}`
                            : menuType === "location"
                              ? `#${item}`
                              : `>${item}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
          </div>
        </div>
      );
    };
  },
);

const buttonStyle = css({
  appearance: "none",
  font: "inherit",
  textAlign: "center",
  cursor: "pointer",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  border: 0,
  borderRadius: "8px",
  color: "#fff",
  background: "var(--accent-color)",
  transition: "all 150ms ease",
  fontWeight: "bold",
  "&:hover, &:focus-visible": {
    background: "var(--accent-hover)",
    outline: "none",
  },
});

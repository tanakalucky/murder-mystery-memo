import { clientEntry, css, ref, type Handle } from "remix/ui";
import { TimelineViewModel } from "../../stores/TimelineViewModel.ts";
import { PlayersViewModel } from "../../stores/PlayersViewModel.ts";
import { TimesViewModel } from "../../stores/TimesViewModel.ts";

const FONT_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

export const TimeTable = clientEntry(
  import.meta.url,
  function TimeTable(handle: Handle) {
    const vm = new TimelineViewModel();
    const playersVm = new PlayersViewModel();
    const timesVm = new TimesViewModel();

    let isMounted = false;

    vm.addEventListener("change", () => handle.update());
    playersVm.addEventListener("change", () => handle.update());
    timesVm.addEventListener("change", () => handle.update());

    return () => {
      // サーバーサイド・ハイドレーション初期状態のプレースホルダー表示
      if (!isMounted) {
        return (
          <div
            mix={[
              css({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 24px",
                textAlign: "center",
                gap: "24px",
                background: "var(--bg-card)",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                margin: "48px 24px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }),
              ref((el: unknown) => {
                if (el && !isMounted) {
                  isMounted = true;
                  setTimeout(() => {
                    handle.update();
                  }, 0);
                }
              }),
            ]}
          >
            <div mix={css({ fontSize: "48px" })}>📅</div>
            <h2 mix={css({ fontSize: "20px", fontWeight: "bold", margin: 0 })}>
              タイムテーブルを読み込んでいます...
            </h2>
            <p
              mix={css({
                color: "var(--text-secondary)",
                maxWidth: "400px",
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.6,
              })}
            >
              データを読み込んでいます。しばらくお待ちください。
            </p>
          </div>
        );
      }

      const events = vm.events || [];
      const players = playersVm.players || [];
      const times = timesVm.times || [];

      // 実際にイベントが存在するかチェック (マウント完了後)
      if (events.length === 0) {
        return (
          <div
            mix={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
              textAlign: "center",
              gap: "24px",
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              margin: "48px 24px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            })}
          >
            <div
              mix={css({
                fontSize: "48px",
              })}
            >
              📅
            </div>
            <h2 mix={css({ fontSize: "20px", fontWeight: "bold", margin: 0 })}>
              タイムテーブルデータがありません
            </h2>
            <p
              mix={css({
                color: "var(--text-secondary)",
                maxWidth: "400px",
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.6,
              })}
            >
              タイムラインメモでキャラクターや時間、場所を登録すると、ここに自動的にタイムテーブルが生成されます。
            </p>
            <a
              href="/memo"
              rmx-document=""
              mix={css({
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 24px",
                borderRadius: "8px",
                background: "var(--accent-color)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 150ms ease",
                boxShadow: "0 4px 12px rgba(225, 29, 72, 0.15)",
                "&:hover": {
                  background: "var(--accent-hover)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(225, 29, 72, 0.25)",
                },
              })}
            >
              メモを入力しに行く
            </a>
          </div>
        );
      }

      // 重複排除したキャラクターリスト (PlayerViewModelにあるもの + イベント内にあるが未登録のもの)
      const eventPlayers = Array.from(
        new Set(
          events.map((e) => e.playerCharacter).filter((p): p is string => !!p),
        ),
      );
      const allPlayers = Array.from(new Set([...players, ...eventPlayers]));

      // 重複排除してソートした時間リスト (TimesViewModelにあるもの + イベント内にあるが未登録のもの)
      const eventTimes = Array.from(
        new Set(events.map((e) => e.time).filter((t): t is string => !!t)),
      );
      const allTimes = Array.from(new Set([...times, ...eventTimes])).sort(
        (a, b) => a.localeCompare(b),
      );

      // キャラクター未指定、時間未指定のイベントが存在するか確認
      const hasUnassignedPlayer = events.some((e) => !e.playerCharacter);
      const hasUnassignedTime = events.some((e) => !e.time);

      // 横軸 (列): キャラクターリスト。未指定イベントがあれば「全体・未指定」列を追加
      const columns = [...allPlayers];
      if (hasUnassignedPlayer) {
        columns.push(""); // 空文字を「未指定」キーとする
      }

      // 縦軸 (行): 時間リスト。未指定イベントがあれば「時間未指定」行を追加
      const rows = [...allTimes];
      if (hasUnassignedTime) {
        rows.push(""); // 空文字を「時間未指定」キーとする
      }

      return (
        <div
          mix={css({
            padding: "48px 24px",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            "@media (max-width: 767px)": {
              padding: "24px 16px",
            },
          })}
        >
          {/* Table Container with Sticky Scrolling */}
          <div
            mix={css({
              width: "100%",
              maxHeight: "calc(100vh - 220px)",
              overflow: "auto",
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            })}
          >
            <table
              mix={css({
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontFamily: FONT_STACK,
                fontSize: "13px",
                textAlign: "left",
              })}
            >
              <thead>
                <tr>
                  {/* 左上セル (時間見出し) */}
                  <th
                    mix={css({
                      position: "sticky",
                      left: 0,
                      top: 0,
                      zIndex: 20,
                      background: "var(--bg-sidebar)",
                      color: "var(--text-sidebar)",
                      padding: "16px",
                      fontWeight: "bold",
                      borderBottom: "2px solid var(--border-color)",
                      minWidth: "120px",
                      boxShadow: "2px 2px 5px rgba(0,0,0,0.15)",
                    })}
                  >
                    時間
                  </th>
                  {/* キャラクター名見出し */}
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      mix={css({
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        background: "var(--bg-sidebar)",
                        color: "var(--text-sidebar)",
                        padding: "16px",
                        fontWeight: "bold",
                        borderBottom: "2px solid var(--border-color)",
                        minWidth: "240px",
                        borderRight:
                          idx < columns.length - 1
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "none",
                      })}
                    >
                      {col === "" ? (
                        <span
                          mix={css({
                            fontStyle: "italic",
                            color: "var(--text-sidebar-muted)",
                          })}
                        >
                          全体・未指定
                        </span>
                      ) : (
                        <span
                          mix={css({
                            color: "var(--accent-light)",
                            fontWeight: "bold",
                          })}
                        >
                          @{col}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rowTime, rowIdx) => {
                  const isLastRow = rowIdx === rows.length - 1;
                  return (
                    <tr
                      key={rowIdx}
                      mix={css({
                        "&:hover td": {
                          background: "rgba(0, 0, 0, 0.01)",
                          "@media (prefers-color-scheme: dark)": {
                            background: "rgba(255, 255, 255, 0.01)",
                          },
                        },
                      })}
                    >
                      {/* 時間列 (左端 sticky) */}
                      <td
                        mix={css({
                          position: "sticky",
                          left: 0,
                          zIndex: 5,
                          background: "var(--bg-card)",
                          padding: "16px",
                          fontWeight: "bold",
                          borderBottom: isLastRow
                            ? "none"
                            : "1px solid var(--border-color)",
                          borderRight: "2px solid var(--border-color)",
                          boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
                          color: "var(--text-primary)",
                        })}
                      >
                        {rowTime === "" ? (
                          <span
                            mix={css({
                              fontStyle: "italic",
                              color: "var(--text-secondary)",
                            })}
                          >
                            未指定
                          </span>
                        ) : (
                          <span mix={css({ color: "var(--accent-color)" })}>
                            {rowTime}
                          </span>
                        )}
                      </td>

                      {/* 各セル (キャラクターごとのイベント) */}
                      {columns.map((colPlayer, colIdx) => {
                        // この時間・キャラクターに合致するイベントをフィルタリング
                        const cellEvents = events.filter((e) => {
                          const timeMatch = (e.time || "") === rowTime;
                          const playerMatch =
                            (e.playerCharacter || "") === colPlayer;
                          return timeMatch && playerMatch;
                        });

                        const hasEvents = cellEvents.length > 0;
                        const isLastCol = colIdx === columns.length - 1;

                        return (
                          <td
                            key={colIdx}
                            mix={css({
                              padding: "12px 16px",
                              borderBottom: isLastRow
                                ? "none"
                                : "1px solid var(--border-color)",
                              borderRight: isLastCol
                                ? "none"
                                : "1px solid var(--border-color)",
                              verticalAlign: "top",
                              background: hasEvents
                                ? "transparent"
                                : "var(--bg-app)",
                              opacity: hasEvents ? 1 : 0.5,
                              minHeight: "80px",
                              transition: "background 150ms ease",
                            })}
                          >
                            {hasEvents ? (
                              <div
                                mix={css({
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "10px",
                                })}
                              >
                                {cellEvents.map((ev, evIdx) => (
                                  <div
                                    key={evIdx}
                                    mix={css({
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      background: "var(--bg-card)",
                                      padding: "12px",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      borderLeft:
                                        "4px solid var(--accent-color)",
                                      boxShadow:
                                        "0 2px 8px rgba(0, 0, 0, 0.02)",
                                    })}
                                  >
                                    {/* メモ本文 */}
                                    <div
                                      mix={css({
                                        color: "var(--text-primary)",
                                        lineHeight: 1.5,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-all",
                                        fontWeight: 500,
                                      })}
                                    >
                                      {ev.body}
                                    </div>
                                    {/* 場所情報バッジ */}
                                    {ev.location && (
                                      <div mix={css({ display: "flex" })}>
                                        <span
                                          mix={css({
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            color: "var(--accent-color)",
                                            background: "var(--accent-light)",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            fontWeight: "bold",
                                          })}
                                        >
                                          📍 {ev.location}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                mix={css({
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--text-secondary)",
                                  fontSize: "12px",
                                  fontStyle: "italic",
                                  minHeight: "40px",
                                  opacity: 0.3,
                                })}
                              >
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
  },
);

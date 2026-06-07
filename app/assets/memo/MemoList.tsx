import { css, type Handle } from "remix/ui";
import { type TimelineEvent } from "../../stores/TimelineViewModel.ts";

export function MemoList(handle: Handle<{ events: TimelineEvent[] }>) {
  return () => {
    const events = handle.props.events;
    return (
      <div
        mix={css({
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          margin: "1.5rem 0",
        })}
      >
        {events.map((event, index) => (
          <div
            key={index}
            mix={css({
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1rem",
              borderRadius: "8px",
              background: "var(--surface-4)",
              border: "1px solid var(--surface-3)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            })}
          >
            <div
              mix={css({
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              })}
            >
              {event.playerCharacter && (
                <span
                  mix={css({
                    background: "rgba(45, 172, 249, 0.15)",
                    color: "var(--brand-blue)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  })}
                >
                  @{event.playerCharacter}
                </span>
              )}
              {event.time && (
                <span
                  mix={css({
                    background: "var(--surface-3)",
                    color: "var(--text-primary)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  })}
                >
                  🕒 {event.time}
                </span>
              )}
              {event.location && (
                <span
                  mix={css({
                    background: "var(--surface-3)",
                    color: "var(--text-primary)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  })}
                >
                  📍 {event.location}
                </span>
              )}
            </div>
            <div
              mix={css({
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              })}
            >
              {event.body}
            </div>
          </div>
        ))}
      </div>
    );
  };
}

import { memo } from "react";

interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton = memo(function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: "var(--color-danger)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        letterSpacing: "0.025em",
        border: "1px solid var(--color-danger-hover)",
        boxShadow: "var(--shadow-md)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-danger-hover)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-danger)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      type="button"
    >
      すべてリセット
    </button>
  );
});

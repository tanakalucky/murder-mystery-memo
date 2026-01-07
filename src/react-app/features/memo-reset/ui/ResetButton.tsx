import { memo } from "react";

interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton = memo(function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="px-6 py-2 font-semibold rounded-md transition-all duration-200 hover:shadow-lg bg-danger text-text-primary"
      style={{
        boxShadow: "0 0 10px rgba(139, 21, 56, 0.3)",
      }}
      type="button"
    >
      すべてリセット
    </button>
  );
});

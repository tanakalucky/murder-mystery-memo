import { memo } from "react";

interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton = memo(function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="px-6 py-2 bg-danger text-primary font-semibold rounded-md hover:bg-opacity-80 transition-colors duration-200"
      type="button"
    >
      すべてリセット
    </button>
  );
});

import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/AlertDialog";
import { Button } from "@/shared/ui/Button";

type Props = {
  onConfirm: () => void;
};

export const ResetButton = ({ onConfirm }: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-noir-dusty-ash hover:bg-noir-dark-walnut hover:text-noir-old-paper"
          />
        }
      >
        <Trash2 className="size-4" />
        リセット
      </AlertDialogTrigger>
      <AlertDialogContent className="border-noir-aged-wood bg-noir-dark-walnut text-noir-old-paper">
        <AlertDialogHeader>
          <AlertDialogTitle>すべてのメモを削除しますか？</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-noir-aged-wood text-noir-dusty-ash hover:bg-noir-aged-wood hover:text-noir-old-paper">
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-noir-crimson text-noir-old-paper hover:bg-noir-crimson/80"
            onClick={onConfirm}
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

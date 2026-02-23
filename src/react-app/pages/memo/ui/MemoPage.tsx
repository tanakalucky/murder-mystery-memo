import { useEffect } from "react";

import { MemoInput, migrateIfNeeded, useMemoCards, useMemoListOrder } from "@/features/memo-card";

import { MemoMixedList } from "./MemoMixedList";

export function MemoPage() {
  useEffect(() => {
    migrateIfNeeded();
  }, []);

  const {
    cards,
    addCard,
    updateCard,
    deleteCard,
    deleteAllCards,
    reorderCards,
    moveCardToParent,
    clearChildrenFromParent,
  } = useMemoCards();
  const {
    listOrder,
    collapseState,
    reorderListItems,
    addCardToListOrder,
    removeCardFromListOrder,
    syncListOrder,
    toggleCollapse,
    dissolveParent,
  } = useMemoListOrder(cards);

  const handleAddCard = (body: string) => {
    const id = addCard(body);
    addCardToListOrder(id);
  };

  const handleDeleteCard = (id: string) => {
    const childIds = cards.filter((c) => c.parentId === id).map((c) => c.id);

    if (childIds.length > 0) {
      // 親カードの削除: 子をルートレベルに戻す
      clearChildrenFromParent(id);
      dissolveParent(id, childIds);
    } else {
      removeCardFromListOrder(id);
    }

    deleteCard(id);
  };

  const handleDeleteAllCards = () => {
    deleteAllCards();
    syncListOrder([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-950">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-8 text-center font-serif text-2xl font-bold tracking-wide text-amber-100/90">
            Murder Mystery Memo
          </h1>

          <MemoMixedList
            cards={cards}
            listOrder={listOrder}
            collapseState={collapseState}
            onUpdateCard={updateCard}
            onDeleteCard={handleDeleteCard}
            onMoveCardToParent={moveCardToParent}
            onReorderListItems={reorderListItems}
            onReorderCards={reorderCards}
            onToggleCollapse={toggleCollapse}
            onSyncListOrder={syncListOrder}
          />
        </div>
      </div>

      <MemoInput
        onSubmit={handleAddCard}
        onDeleteAll={handleDeleteAllCards}
        hasCards={cards.length > 0}
      />
    </div>
  );
}

import { MemoCardList, MemoInput, useMemoCards } from "@/features/memo-card";

export function MemoPage() {
  const { cards, addCard, updateCard, deleteCard, deleteAllCards, reorderCards } = useMemoCards();

  return (
    <div className="flex min-h-screen flex-col bg-stone-950">
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-8 text-center font-serif text-2xl font-bold tracking-wide text-amber-100/90">
            Murder Mystery Memo
          </h1>

          <MemoCardList
            cards={cards}
            onUpdate={updateCard}
            onDelete={deleteCard}
            onReorder={reorderCards}
          />
        </div>
      </div>

      <MemoInput onSubmit={addCard} onDeleteAll={deleteAllCards} hasCards={cards.length > 0} />
    </div>
  );
}

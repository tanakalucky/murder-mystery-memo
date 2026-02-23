import { MemoInput, useMemoCards } from "@/features/memo-card";
import { useMemoGroups } from "@/features/memo-group";

import { MemoMixedList } from "./MemoMixedList";

export function MemoPage() {
  const { cards, addCard, updateCard, deleteCard, deleteAllCards, reorderCards, moveCardToGroup } =
    useMemoCards();
  const {
    groups,
    listOrder,
    addGroup,
    deleteGroup,
    renameGroup,
    toggleCollapse,
    reorderListItems,
    addCardToListOrder,
    removeCardFromListOrder,
    syncListOrder,
  } = useMemoGroups(cards);

  const handleAddCard = (body: string) => {
    const id = addCard(body);
    addCardToListOrder(id);
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
    removeCardFromListOrder(id);
  };

  const handleDeleteAllCards = () => {
    deleteAllCards();
    // Remove all card items from listOrder, keep groups
    const groupsOnly = listOrder.filter((item) => item.type === "group");
    syncListOrder(groupsOnly);
  };

  const handleDeleteGroup = (groupId: string, cardIds: string[]) => {
    // Clear groupId for all cards in this group
    for (const cardId of cardIds) {
      moveCardToGroup(cardId, undefined);
    }
    deleteGroup(groupId, cardIds);
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
            groups={groups}
            listOrder={listOrder}
            onUpdateCard={updateCard}
            onDeleteCard={handleDeleteCard}
            onMoveCardToGroup={moveCardToGroup}
            onReorderListItems={reorderListItems}
            onReorderCards={reorderCards}
            onToggleCollapse={toggleCollapse}
            onRenameGroup={renameGroup}
            onDeleteGroup={handleDeleteGroup}
            onSyncListOrder={syncListOrder}
          />
        </div>
      </div>

      <MemoInput
        onSubmit={handleAddCard}
        onDeleteAll={handleDeleteAllCards}
        onAddGroup={addGroup}
        hasCards={cards.length > 0}
      />
    </div>
  );
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

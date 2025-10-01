export interface TimelineEntry {
  id: string;
  content: string;
  day: number;
  hour: number;
  timestamp: Date;
  isEditing?: boolean;
}

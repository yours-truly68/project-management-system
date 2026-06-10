export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ColumnCreateInput {
  board_id: string;
  name: string;
  position: number;
  color?: string;
}

export interface ColumnUpdateInput {
  name?: string;
  position?: number;
  color?: string | null;
}

export interface ColumnReorderInput {
  ordered_ids: string[];
}

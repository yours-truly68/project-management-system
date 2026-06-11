import { Project } from "@/features/projects/types/project.types";
import { Board } from "@/features/boards/types/board.types";

export interface Favorite {
  id: string;
  user_id: string;
  entity_type: "project" | "board";
  entity_id: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  board?: Board;
}

export interface FavoriteCreateInput {
  entity_type: "project" | "board";
  entity_id: string;
}

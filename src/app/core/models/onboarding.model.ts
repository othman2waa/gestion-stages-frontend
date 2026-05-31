export interface ChecklistItemResponse {
  id: number;
  etape: string;
  categorie: string;
  description: string;
  completed: boolean;
  completedAt: string;
  completedBy: string;
  ordre: number;
  stagiaireId: number;
  stagiaireNom: string;
}

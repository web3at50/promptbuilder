export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type CreatePromptDto = {
  title: string;
  content: string;
  tags?: string[];
  favorite?: boolean;
};

export type UpdatePromptDto = Partial<CreatePromptDto>;

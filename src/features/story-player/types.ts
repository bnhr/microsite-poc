export type BaseStory = {
  id: string;
  duration: number;
  background: string;
  accent?: string;
  shareable?: boolean;
};

export type CoverStory = BaseStory & {
  type: "cover";
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export type HeroStory = BaseStory & {
  type: "hero";
  title: string;
  description?: string;
};

export type StatStory = BaseStory & {
  type: "stat";
  label: string;
  value: string;
  note?: string;
};

export type RankingStory = BaseStory & {
  type: "ranking";
  title: string;
  items: string[];
};

export type Story = CoverStory | HeroStory | StatStory | RankingStory;
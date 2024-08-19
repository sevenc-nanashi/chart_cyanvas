export type Chart = {
  name: string;
  title: string;
  composer: string;
  artist: string | undefined;
  author: User;
  authorName: string;
  coAuthors: User[];
  publishedAt: string;
  updatedAt: string;
  cover: string;
  bgm: string;
  chart: {
    url: string | undefined;
    type: "sus" | "mmws" | "chs";
  };
  data: string | undefined;
  variants: Chart[];
  variantOf: Chart | undefined;
  tags: string[];
  visibility: "public" | "private" | "scheduled";
  isChartPublic: boolean;
  scheduledAt: string | undefined;
  rating: number;
  description: string;
  likes: number;
};

export type User = {
  handle: string;
  name: string;
  aboutMe: string;
  bgColor: string;
  fgColor: string;
  chartCount: number;
};

export type AdminUser = User & { altUsers: User[] };

export type DiscordInfo = {
  displayName: string;
  username: string;
  avatar: string;
};

export type Session =
  | {
      loggedIn: true;
      user: User;
      altUsers: User[];
      discord: DiscordInfo | undefined;
    }
  | { loggedIn: false };

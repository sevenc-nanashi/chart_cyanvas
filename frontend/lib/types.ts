export type Chart = {
  name: string;
  title: string;
  composer: string;
  artist: string | null;
  author: User;
  authorName: string;
  coAuthors: User[];
  publishedAt: string;
  updatedAt: string;
  cover: string;
  bgm: string;
  chart: {
    url: string | null;
    type: "sus" | "mmws" | "chs" | "usc";
  };
  data: string | null;
  variants: Chart[];
  variantOf: Chart | null;
  genre: string;
  tags: string[];
  visibility: "public" | "private" | "scheduled";
  isChartPublic: boolean;
  scheduledAt: string | null;
  rating: number;
  description: string;
  likes: number;
};

export type User = {
  handle: string;
  name: string;
  aboutMe: string;
  avatar: Avatar;
  chartCount: number;
  userType: "admin" | "user";
};

export type Avatar = {
  type: "default" | `theme-${string}`;
  foregroundType: string;
  foregroundColor: string;
  backgroundType: "default" | `theme-${string}`;
  backgroundColor: string;
};

export type AdminOnlyUserData = User & { altUsers: User[] };

export type DiscordInfo = {
  displayName: string;
  username: string;
  avatar: string;
};

export type Warning = {
  id: number;
  createdAt: string;
  updatedAt: string;
  chartTitle: string;
  reason: string;
  level: "soft" | "hard" | "critical" | "ban";
  seen: boolean;
  active: boolean;
};

export type Session =
  | {
      loggedIn: true;
      user: User;
      altUsers: User[];
      discord: DiscordInfo | undefined;
      warnings: Warning[];
    }
  | { loggedIn: false };

export type ServerSettings = {
  discordEnabled: boolean;
  genres: string[];
  host: string;
};

export type Theme = "dark" | "light" | "auto";

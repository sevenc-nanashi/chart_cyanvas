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
  bgColor: string;
  fgColor: string;
  chartCount: number;
  userType: "admin" | "user";
};

export type AdminOnlyUserData = User & { altUsers: User[] };

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

export type ServerSettings = {
  discordEnabled: boolean;
  host: string;
};

export type Theme = "dark" | "light" | "auto";

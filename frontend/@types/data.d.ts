interface Chart {
  name: string
  title: string
  composer: string
  artist: string | undefined
  author: User
  authorName: string
  coAuthors: User[]
  publishedAt: string
  updatedAt: string
  cover: string
  bgm: string
  chart: {
    url: string | undefined
    type: "sus" | "mmws"
  }
  data: string | undefined
  variants: Chart[]
  variantOf: Chart | undefined
  tags: string[]
  visibility: "public" | "private" | "scheduled"
  isChartPublic: boolean
  scheduledAt: string | undefined
  rating: number
  description: string
  likes: number
}

interface User {
  handle: string
  name: string
  aboutMe: string
  bgColor: string
  fgColor: string
  chartCount: number
}

type AdminUser = User & { altUsers: User[] }

type DiscordInfo = {
  displayName: string
  username: string
  avatar: string
}

type Session =
  | {
      loggedIn: true
      user: User
      altUsers: User[]
      discord: DiscordInfo | undefined
    }
  | { loggedIn: false }
  | { loggedIn: undefined }

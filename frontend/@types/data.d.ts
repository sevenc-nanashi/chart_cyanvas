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
  sus: string | undefined
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

type Session =
  | { loggedIn: true; user: User; altUsers: User[] }
  | { loggedIn: false }
  | { loggedIn: undefined }

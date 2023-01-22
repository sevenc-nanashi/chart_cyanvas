interface Chart {
  name: string
  title: string
  composer: string
  artist: string | null
  author: User
  authorName: string
  coAuthors: User[]
  createdAt: number
  updatedAt: number
  cover: string
  bgm: string
  sus: string | null
  data: string | null
  variants: Chart[]
  variantOf: Chart | null
  tags: string[]
  isPublic: boolean
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

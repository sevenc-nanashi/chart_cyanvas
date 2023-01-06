import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }
  try {
    await res.revalidate(req.body.path)
    console.log("Revalidated", req.body.path)
    return res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).json({ revalidated: false })
  }
}

export default handler

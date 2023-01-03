import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }
  const body = JSON.parse(req.body)
  try {
    await res.revalidate(body.path)
    return res.json({ revalidated: true })
  } catch (err) {
    return console.log(err)
  }
}

export default handler

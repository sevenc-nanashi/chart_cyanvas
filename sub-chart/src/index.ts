import app from "./server"

const port = 3201
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})

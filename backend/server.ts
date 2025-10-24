import Init from './db'
import * as db from './db'
import express, {Request, Response} from './express.ts';

Init()

const app = express()
app.setCors("ALL")

app.get('/', async(_req: Request, res: Response) => {
  try {
    const data = await db.getAllTodos()
    console.log("Data:", data)
    res.setStatus(200)
    res.send(data)
  } catch (e) {
    res.setStatus(400)
    res.send(`get all todos database ${e}`)
  }
})

app.get('/filter', async(req: Request, res: Response) => {
  const id = Number(req.id())
  try {
    const data = await db.getFilteredTodos(id)
    res.setStatus(200)
    res.send(data)
  } catch (e) {
    res.setStatus(400)
    res.send(`get filter database ${e}`)
  }
})

app.get('/filter', async(req: Request, res: Response) => {
  const id = Number(req.id())
  try {
    const data = await db.getFilteredTodos(id)
    res.setStatus(200)
    res.send(data)
  } catch (e) {
    res.setStatus(400)
    res.send(`get filter database ${e}`)
  }
})

app.post('/tasks', async(req: Request, res: Response) => {
  const body = await req.body()
  console.log("body", body)
  let id;
  let name
  try {
    if (body.category_name) {
      [id, name] = await db.postCategories(body)
    }
  } catch (e) {
    res.setStatus(400)
    res.send(`error creating category: ${e}`)
  }
  try {
    console.log("ID OBJECT", id.id)
    console.log("ID number", id.name)
    const data = await db.postTodos(body)
    data[0].category_id = id.id
    data[0].category_name = id.name
    res.setStatus(201)
    res.send(data)
  } catch (e) {
    res.setStatus(400)
    res.send(`post to todos database ${e}`)
  }
})

app.put('/tasks/', async(req, res) => {
  const body = await req.body()
  const id = Number(req.id())
  const data = await db.updateTodos(body, id)
  res.setStatus(204)
  res.send(data)
})

app.delete('/tasks', async(req, res) => {
  const id = Number(req.id())
  await db.deleteTodo(id)
  await db.deleteCategories()
  console.log("Deleted todo")
  res.setStatus(204)
  res.send({message: "Deleted"})
})

app.listen(8080, () => {
  console.log("Server listening on port 8080")
})

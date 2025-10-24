import * as http from 'http'
import * as db from './db';

db.default()

async function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  const pathname = new URL(req.url!, 'http://localhost:8080').pathname

  if (req.method === "OPTIONS") {
    console.log(`Method: ${req.method}`)
    res.writeHead(204)
    res.end()
  }

  else if (req.method === "GET" && pathname === '/tasks') {
    console.log(`Method: ${req.method}`)
    const todos = await db.getAllTodos()
    res.writeHead(200, {'content-type': 'application/json'})
    res.end(JSON.stringify(todos))
  }

  else if (req.method === "GET" && pathname === '/categories') {
    console.log(`Method: ${req.method}`)
    const categories = await db.getAllCategories()
    res.writeHead(200, {'content-type': 'application/json'})
    res.end(JSON.stringify(categories))
  }

  else if (req.method === "GET" && pathname === '/done') {
    console.log(`Method: ${req.method}`)
    const todos = await db.exec('select * from todos where done = true;', [])
    res.writeHead(200, {'content-type': 'application/json'})
    res.end(JSON.stringify(todos))
  }

  else if (req.method === "POST") {
    console.log(`Method: ${req.method}`)
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async() => {
      const newTodo = JSON.parse(body) 
      const categories = await db.postCategories(newTodo.category)
      const todo = await db.postTodos(newTodo)
      console.log("Categories:", categories);
      res.writeHead(201, {'content-type': 'application/json'})
      res.end(JSON.stringify(todo.concat(categories)))
    })
  }

  else if (req.method === "PUT") {
    let body = ''
    const id = pathname.split('/')[2]
    req.on('data', c => body += c)
    req.on('end', async() => {
      const newTodo = JSON.parse(body);
      const todo = await db.updateTodos(newTodo, Number(id!))
      res.writeHead(204, {'content-type': 'application/json'})
      res.end(JSON.stringify(todo))
    })
  }

  else if (req.method === "DELETE") {
    const id = pathname.split('/')[2]
    await db.deleteTodo(Number(id))
    await db.deleteCategories()
    res.writeHead(204)
    res.end()
  }
}

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "content-type: application/json")
  handler(req, res)
})

server.listen(3000, () => {
  console.log("Server listening on port 8080")
})

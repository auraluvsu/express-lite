import * as http from 'http';

type Method = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "ALL"

export class Response extends http.ServerResponse {
  status: number = 200;
  setStatus(status: number) {
    this.status = status
  }

  send(data: any) {
    const json = typeof data === "object"
    if (!json) {
      this.setHeader("Access-Control-Allow-Headers", "content-type : text/plain")
      this.writeHead(this.status)
      this.end(String(data))
    } else {
      this.setHeader("Access-Control-Allow-Headers", "content-type : application/json")
      this.writeHead(this.status)
      this.end(JSON.stringify(data))
    }
  }
}

export class Request extends http.IncomingMessage {
  id() {
    return idSplitter(this.url!)
  }
  body(): Promise<any> {
    return new Promise((res, rej) => { 
      let body: string = ''
      this.on('data', c => body += c)
      this.on('end', () => {
        try {
          res(JSON.parse(body))
        } catch (e) {
          rej(e) 
        }
      })
    })
  }
}

class App {
  routes: any[] = []
  method: Method = "OPTIONS"
  private cors: string = "OPTIONS" 

  setCors(cor: Method) {
    if (cor === "ALL") {
      this.cors = "GET, POST, PUT, DELETE, OPTIONS"
    } else {
      this.cors = cor
    }
  }

  get(path: string, cb: (req: Request, res: Response) => void) {
    this.routes.push({method: "GET", path, cb})
  }

  post(path: string, cb: (req: Request, res: Response) => void) {
    this.routes.push({method: "POST", path, cb})
  }

  put(path: string, cb: (req: Request, res: Response) => void) {
    this.routes.push({method: "PUT", path, cb})
  }

  delete(path: string, cb: (req: Request, res: Response) => void) {
    this.routes.push({method: "DELETE", path, cb})
  }

  listen(port: number, cb: () => void) {
    const server = http.createServer((request, response) => {
      const req = Object.setPrototypeOf(request, Request.prototype) as Request
      const res = Object.setPrototypeOf(response, Response.prototype) as Response

      if (this.cors.length > 0) {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", this.cors)
        if (req.method === "OPTIONS") {
          res.writeHead(204)
          res.end()
        }
      }

      for (const route of this.routes) {
        const url = new URL(req.url!, `http://localhost:8080`)
        console.log("method:", route.method, "\npath:", route.path)
        console.log("URL:", url.pathname.split("/")[1])
        if (req.method === route.method && route.path.includes(url.pathname.split("/")[1])) {
          if (route.method === "GET") res.statusCode = 200
          else if (route.method === "POST") res.statusCode = 201
          else if (route.method === "PUT") res.statusCode = 204
          else if (route.method === "DELETE") res.statusCode = 204
          route.cb(req, res)
          return
        }
      }

      res.writeHead(404, {'content-type': 'application/json'})
      res.end(JSON.stringify({error: "Not found"}))
    })
    server.listen(port, cb)
  }
}

function idSplitter(path: string) {
  const url = new URL(path, "http://localhost:8080")
  console.log("ID URL:", url)
  const splitPath = url.pathname.split("/")[2]
  return splitPath
}
export default function express() {
  return new App()
}

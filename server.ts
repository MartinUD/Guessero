import { Application, Router } from "@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();
const app = new Application();

app.use(oakCors({
  origin: "http://localhost:4200", // Your Angular dev server
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

router.get("/test", (context) => {
    context.response.headers.set("Content-Type", "application/json");
    context.response.body = JSON.stringify({ message: "THIS IS A TEST MESSAGE" });
  });

app.use(router.routes());
console.log("Server running on port 8000");
await app.listen({ port: 8000 });

//deno run --allow-net server.ts
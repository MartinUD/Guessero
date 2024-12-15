import { Application, Router } from "@oak/oak";

const router = new Router();

router.get("/test", (context) => {context.response.body = "Hello world2";});

const app = new Application();

app.use(router.routes());

await app.listen({ port: 8000 });


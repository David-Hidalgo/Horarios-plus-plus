import { Elysia } from "elysia";
import mongoose, { type ConnectOptions } from "mongoose";

import { plugin } from "./controllers/routes/schedules.routes";

const app = new Elysia()
	.get("/", () => "Hello Elysia")
	.post("/hi", () => "hi")
	.use(plugin({ prefix: "Schedules" }))
	.onError(({ code }) => {
		if (code === "NOT_FOUND") return "Route not found :{";
	})
	.listen(3000);

const uri = "mongodb://127.0.0.1:27017/horariospp";
const clientOptions: ConnectOptions = {};

async function run() {
	await mongoose.connect(uri, clientOptions);
	await mongoose.connection.db.admin().command({ ping: 1 });
	console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

run().catch(console.dir);
console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

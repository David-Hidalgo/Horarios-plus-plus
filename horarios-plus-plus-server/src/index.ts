import { Elysia } from "elysia";
import mongoose, { type ConnectOptions } from "mongoose";

import {DBController} from "./controllers/db";

import { plugin } from "./routes/schedules.routes";
import { pluginSession } from "./routes/sessions.routes";
import { pluginSection } from "./routes/sections.routes";
import { pluginSubject } from "./routes/subjects.routes";
import { pluginUser } from "./routes/user.routes";


const username = encodeURIComponent("DanCas");
const password = encodeURIComponent("queso");

const uri = //"mongodb://127.0.0.1:27017/horariospp";															//Conexión a base de datos de manera local
			`mongodb+srv://${username}:${password}@horariosplus.pktabwe.mongodb.net/?retryWrites=true&w=majority`; //Conexión a base de datos de manera remota
	
const clientOptions: ConnectOptions = {};
const controladordb:DBController = await DBController.run(uri);

const app = new Elysia()
	.get("/", () => "Hello Elysia")
	.post("/hi", () => "hi")
	.use(plugin({ prefix: "Schedules" }))
	.use(pluginSession({ prefix: "Sessions" }, controladordb))
	.use(pluginSection({ prefix: "Sections" }, controladordb))
	.use(pluginSubject({ prefix: "Sections" }, controladordb))
	.use(pluginUser({ prefix: "Sections" }, controladordb))

	.onError(({ code }) => {
		if (code === "NOT_FOUND") return "Route not found :{";
	})
	.listen(3000);



console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;

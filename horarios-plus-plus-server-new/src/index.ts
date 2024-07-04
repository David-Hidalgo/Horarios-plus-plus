import { Elysia } from "elysia";
import mongoose, { type ConnectOptions } from "mongoose";
import { cors } from "@elysiajs/cors";
import { DBStarter } from "./controllers/db";

import { pluginSchedule } from "./routes/schedules.routes";
import { pluginSession } from "./routes/sessions.routes";
import { pluginSection } from "./routes/sections.routes";
import { pluginSubject } from "./routes/subjects.routes";
import { pluginUser } from "./routes/user.routes";
import { pluginEvent } from "./routes/event.routes";

const username = encodeURIComponent("DanCas");
const password = encodeURIComponent("queso");

const uri =
	"mongodb://127.0.0.1:27017/horariospp";															//Conexión a base de datos de manera local
	  //`mongodb+srv://${username}:${password}@horariosplus.pktabwe.mongodb.net/?retryWrites=true&w=majority`; //Conexión a base de datos de manera remota

const clientOptions: ConnectOptions = {};
const controladordb: DBStarter = await DBStarter.run(uri);

class main {
	public controller;
	public dbController;
	constructor(controladordb: DBStarter) {
		this.dbController = controladordb;
		const controlador = new Elysia()
			.use(cors())
			.get("/", () => "Hello Elysia")
			.use(pluginSchedule({ prefix: "Schedules" }, controladordb))
			.use(pluginSession({ prefix: "Sessions" }, controladordb))
			.use(pluginSection({ prefix: "Sections" }, controladordb))
			.use(pluginSubject({ prefix: "Sections" }, controladordb))
			.use(pluginUser({ prefix: "Sections" }, controladordb))
			.use(pluginEvent({ prefix: "/api/events" }, controladordb))

			.onError(({ code }) => {
				if (code === "NOT_FOUND") return "Route not found :{";
			})
			.listen(4000);

		console.log(
			`🦊 Elysia is running at ${controlador.server?.hostname}:${controlador.server?.port}`,
		);
		this.controller = controlador;
	}
	/**
	 * run
	 */
	static run() {
		const app = new main(controladordb);
		
	}
}

main.run();

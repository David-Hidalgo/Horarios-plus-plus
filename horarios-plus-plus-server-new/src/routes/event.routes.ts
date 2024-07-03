import type { DBStarter } from "../controllers/db";
import Elysia, { t } from "elysia";

export const pluginEvent = <T extends string>(
	config: { prefix: T },
	db: DBStarter,
) =>
	new Elysia({
		name: "my-Event-plugin",
		seed: config,
	})
        .get("/get_events_from_id", async ({query}) => {
            const { id } = query;
            const event = await db.eventModel.findById(id);
            return JSON.stringify(event);
        }
        )
        .get("/get_all_events", async ({query}) => {
            const events = await db.eventModel.find();
            return JSON.stringify(events);
        }
        )
        .post("/create_event", async ({query, body}) => {
            const { owner, session } = body;
            const event = new db.eventModel({
                owner,
                session,
            });
            await event.save();
            return JSON.stringify(event);
        },{
            //así defines lo que pasas como body en el fetch hay que cambiar lo que tengo abajo para que parezca lo que sería el evento
            body: t.Object({
                owner: t.String(),
                session: t.String(),
            }),
        }
        )

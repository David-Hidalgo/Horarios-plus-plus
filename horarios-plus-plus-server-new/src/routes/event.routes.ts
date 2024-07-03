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
            const { name, session } = body;
            const event = new db.eventModel({
                name,
                session,
            });
            await event.save();
            return JSON.stringify(event);
        },{
            //así defines lo que pasas como body en el fetch hay que cambiar lo que tengo abajo para que parezca lo que sería el evento
            body: t.Object({
                name: t.String(),
                session: t.String(),
            }),
        }
        )
        .put("/api/add_session_to_event",async({query,body})=>{
            const name:string=query.name
            const day=body.day;
            const start=body.start;
            const end=body.end;

            const eventos=await db.eventModel.find({name:name})
            for (const evento of eventos) {
                if (evento.sessions!==null || evento.sessions!==undefined ) {
                    evento.sessions.push(new db.sessionModel({
                        day:day,
                        start:start,
                        end:end
                    }
                    ))
                }
            }
            return("creado")
        },{
            body: t.Object({
                day: t.Number(),
                start: t.Date(),
                end: t.Date()

            }),
            query: t.Object({
                name:t.String()
            })
        })

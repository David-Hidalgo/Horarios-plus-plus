// plugin.ts
import { Elysia } from "elysia";
import type { DBStarter } from "../controllers/db";
import { Career, Schedule, Section, Session, Subject, User } from "../models/classes";



export const pluginSchedule = <T extends string>(
	config: { prefix: T },
	db: DBStarter,
) =>
	new Elysia({
		name: "my-Schedule-plugin",
		seed: config,
	})
		.get("/api/schedules/generate_schedules", async ({query}) => {
			const owner = query.owner;
			const nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.error("FAILED TO GENERATE SCHEDULES: A value is undefined");
				return JSON.stringify(undefined);
			}
			
			return db.saveSchedule(owner,nrcs);
		})
		.put("/api/schedules/save_schedule", async ({ query }) => {
			const owner = query.owner;
			const nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.error("FAILED TO SAVE SCHEDULE: A value is undefined");
				return JSON.stringify(undefined);
			}

			const nrcsArr = nrcs.split(",");


			const user = await db.userModel.findOne({ email: owner }).orFail();
			if (user === undefined || user === null) {
				console.error("FAILED TO SAVE SCHEDULE: User not found");
				return JSON.stringify(undefined);
			}
			
			const horarios=await Promise.all(nrcsArr.map(async (nrc) => {
					if (nrc !== null && nrc !==undefined) {
						const section = await db.sectionModel.findOne({ nrc: nrc });
						if (section !== null && section !== undefined) {
							return section;
						}
					}
					}
				)
			)
			if (horarios === undefined || horarios.length === 0 || horarios===null) {
				console.error("FAILED TO SAVE SCHEDULE: A section is not found");
				return JSON.stringify(undefined);
			}	
			user.schedule=horarios.map((section:any) => {
				return section._id;
			}
			);

			user.save();

			return JSON.stringify([]);
		})
		.get("/api/schedule/get_schedule_from_id", async ({ query }) => {
			if (query.id === undefined) {
				return JSON.stringify(undefined);
			}

			const schedule = await db.userModel.findById(query.id);
			if (schedule === undefined) {
				return JSON.stringify(undefined);
			}

			return JSON.stringify(schedule);
		})
		.get("/api/schedule/get_schedule_from_owner", async ({ query }) => {
			if (query.owner === undefined) {
				return JSON.stringify(undefined);
			}

			const user = await db.userModel.findOne({ email: query.owner });
			if (user === undefined || user === null) {
				return JSON.stringify(undefined);
			}

			return JSON.stringify(user.schedule);
		});



// plugin.ts
import { Elysia } from "elysia";
import type { DBController } from "../controllers/db";

async function GenerateSchedules(sectionList, subjectCount) {
	function hourIntersects(x, y) {
		let start_x = new Date(x.start);
		start_x = start_x.getHours() * 60 + start_x.getMinutes();
		let start_y = new Date(y.start);
		start_y = start_y.getHours() * 60 + start_y.getMinutes();

		let end_x = new Date(x.end);
		end_x = end_x.getHours() * 60 + end_x.getMinutes();
		let end_y = new Date(y.end);
		end_y = end_y.getHours() * 60 + end_y.getMinutes();

		return start_x <= end_y && start_y <= end_x;
	}

	async function generageCombination(originalArray, passedArray, finalArray) {
		if (passedArray.length >= subjectCount) {
			finalArray.push(passedArray);
			return;
		}

		for (let i = 0; i < originalArray.length; i++) {
			if (passedArray.includes(originalArray.at(i))) {
				continue;
			}
			if (
				passedArray.some((value) =>
					value.subject.equals(originalArray.at(i).subject),
				)
			) {
				continue;
			}

			let sessionList = passedArray
				.concat(originalArray.at(i))
				.flatMap((value) => value.sessions);
			sessionList = await Promise.all(
				sessionList.map(async (id) => {
					return await Session.findById(new mongoose.mongo.ObjectId(id));
				}),
			);
			if (sessionList.length === 0) {
				continue;
			}
			if (
				sessionList.some((x) =>
					sessionList.some((y) => {
						if (x === y) return false;
						return x.day === y.day ? hourIntersects(x, y) : false;
					}),
				)
			) {
				continue;
			}

			await generageCombination(
				originalArray,
				passedArray.concat(originalArray.at(i)),
				finalArray,
			);
		}
	}

	const returnArray = [];
	await generageCombination(sectionList, [], returnArray);
	return returnArray;
}

export const pluginSchedule = <T extends string>(
	config: { prefix: T },
	db: DBController,
) =>
	new Elysia({
		name: "my-Schedule-plugin",
		seed: config,
	})
		.get("/api/schedules/generate_schedules", async ({query}) => {
			const owner = query.owner;
			const nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.log("FAILED TO GENERATE SCHEDULES: A value is undefined");
				return JSON.stringify(undefined);
			}

			const failed = false;
			let sections = await Promise.all(
				nrcs.split(",").map(async (nrc) => {
					return await db.sectionModel.find({ nrc: nrc });
				}),
			);
			sections = sections.flat();

			const schedules = await GenerateSchedules(
				sections,
				[...new Set(sections.map((section) => section.subject.toString()))]
					.length,
			);
			console.log(schedules);
			return JSON.stringify(schedules);
		})
		.get("/api/schedules/save_schedule", async ({ query }) => {
			const owner = query.owner;
			let nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.log("FAILED TO SAVE SCHEDULE: A value is undefined");
				return JSON.stringify(undefined);
			}

			nrcs = nrcs.split(",");

			const newSchedule = await new Schedule({
				owner: owner,
				sections: await Promise.all(
					nrcs.map(async (nrc) => {
						return await db.sectionModel.findOne({ nrc: nrc });
					}),
				),
			});

			const schedule = await Schedule.findOne({ owner: owner });
			if (schedule !== undefined) {
				await Schedule.deleteOne(schedule);
			}
			await newSchedule.save();

			return JSON.stringify(newSchedule);
		})
		.get("/api/schedule/get_schedule_from_id", async ({ query }) => {
			if (query.id === undefined) {
				return JSON.stringify(undefined);
			}

			const schedule = await Schedule.findById(query.id);
			if (schedule === undefined) {
				return JSON.stringify(undefined);
			}

			return JSON.stringify(schedule);
		})
		.get("/api/schedule/get_schedule_from_owner", async ({ query }) => {
			if (query.owner === undefined) {
				return JSON.stringify(undefined);
			}

			const schedule = await Schedule.findOne({ owner: query.owner });
			if (schedule === undefined) {
				return JSON.stringify(undefined);
			}

			console.log(schedule);
			return JSON.stringify(schedule);
		});



// plugin.ts
import { Elysia } from "elysia";
import type { DBController } from "../controllers/db";
import { number } from "zod";
import { forEachChild } from "typescript";
import { Career, Schedule, Section, Session, Subject, User } from "../models/classes";

// async function GenerateSchedules(sectionList, subjectCount) {
// 	function hourIntersects(x, y) {
// 		let start_x = new Date(x.start);
// 		start_x = start_x.getHours() * 60 + start_x.getMinutes();
// 		let start_y = new Date(y.start);
// 		start_y = start_y.getHours() * 60 + start_y.getMinutes();

// 		let end_x = new Date(x.end);
// 		end_x = end_x.getHours() * 60 + end_x.getMinutes();
// 		let end_y = new Date(y.end);
// 		end_y = end_y.getHours() * 60 + end_y.getMinutes();

// 		return start_x <= end_y && start_y <= end_x;
// 	}

// 	async function generageCombination(originalArray, passedArray, finalArray) {
// 		if (passedArray.length >= subjectCount) {
// 			finalArray.push(passedArray);
// 			return;
// 		}
// 		console.log('el array que se anda pasando\n',passedArray,'\n y el original',originalArray,'\n y el final',finalArray);
		
// 		for (let i = 0; i < originalArray.length; i++) {
// 			if (passedArray.includes(originalArray.at(i))) {
// 				continue;
// 			}
// 			if (
// 				passedArray.some((value) =>
// 					value.subject.equals(originalArray.at(i).subject),
// 				)
// 			) {
// 				continue;
// 			}

// 			const sessionList = passedArray.at(i).sessions

// 			if (sessionList.length === 0) {
// 				continue;
// 			}
// 			if (
// 				sessionList.some((x) =>
// 					sessionList.some((y) => {
// 						if (x === y) return false;
// 						return x.day === y.day ? hourIntersects(x, y) : false;
// 					}),
// 				)
// 			) {
// 				continue;
// 			}

// 			await generageCombination(
// 				originalArray,
// 				passedArray.concat(originalArray.at(i)),
// 				finalArray,
// 			);
// 		}
// 	}

// 	const returnArray = [];
// 	console.log(returnArray);

// 	await generageCombination(sectionList, [], returnArray);
// 	console.log(returnArray);
// 	return returnArray;
// }


async function instanciarTodo(materias:Array<any>, sectionsArr:Array<any>) {
	const a =new Career("Ingeniería en Computación");
	let numeroSec = 0;
	let numeroSub = 0;
	const materiasArr = [];
	let sessionsArr: Session[] = [];
	let sectionsArrTemp = [];
	for await (const materia of materias) {
		await materia.populate("sections");
		const materiaTemp=new Subject(materia.name, [], a);
		sessionsArr = [];
		for await (const section of materia.sections) {
			for await (const sección of sectionsArr) {
				if (section._id.equals(sección._id)) {
					numeroSec++;
					sección.sessions.forEach((session:any) => {
						sessionsArr.push(new Session(session.day, session.start, session.end));
					});
					sectionsArrTemp.push(new Section(sección.nrc, sección.teacher, sessionsArr, materiaTemp));
				}
			}
		}
		if (numeroSec > 0) {
			materiaTemp.sections = sectionsArrTemp;
			numeroSub++;
			materiasArr.push(materiaTemp);
		}
		sectionsArrTemp = [];
		numeroSec = 0;
	}

	if(numeroSub < 1){
		throw new Error("FAILED TO GENERATE SCHEDULES: A subject is not found");
	}
	return materiasArr;
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
				console.error("FAILED TO GENERATE SCHEDULES: A value is undefined");
				return JSON.stringify(undefined);
			}

			const failed = false;
			const sections = await Promise.all(
				nrcs.split(",").map(async (nrc) => {
					return await db.sectionModel.find({ nrc: nrc });
				}),
			);
			const sectionsArr = sections.flat();
			//una busqueda en db.subjectModel para buscar el número de materias que contengan las secciones
			const materias = await db.subjectModel.find({});

			const materiasArr=await instanciarTodo(materias, sectionsArr);

			// console.error(`Numero de materias: ${numeroSub}`, `Numero de secciones: ${sectionsArr.length}`);
			console.log(materiasArr);
			let schedules = new Array();
			const scheduleInicial = new Schedule(new User(owner,"algo",4,[]), []);
			Schedule.recursiveSchedulePush(0, materiasArr, scheduleInicial, schedules);
			schedules = Schedule.filtrarHorariosPorMaterias(schedules, materiasArr);
			console.log("horarios\n",Bun.inspect(schedules,{colors:true,depth: 4}));
			
			// const schedules = await GenerateSchedules(sectionsArr, numeroSub);
			for (const schedule of schedules) {
				for (const section of schedule.sections) {
					section.subject =[];
				}
			}

			return JSON.stringify(schedules);
		})
		.get("/api/schedules/save_schedule", async ({ query }) => {
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
			user.schedule=[];

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

			console.log(user);
			return JSON.stringify(user.schedule);
		});



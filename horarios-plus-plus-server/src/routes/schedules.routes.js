import mongoose, { mongo } from "mongoose";
import { Schedule, Session, Section } from "../models/models.js";


	class SessionC {
    start
    end
    day
    constructor(start, end, day) {
        this.start = start;
        this.end = end;
        this.day = day;
    }
}
	class SubjectC {
		name
		sections
		career
		constructor(name, sections, career) {
			this.name = name;
			this.sections = sections;
			this.career = career;
		}
	}
	class Career {
		name
		subjects
		constructor(name, subjects) {
			this.name = name;
			this.subjects = subjects;
		}
	}
	
	class SectionC {
		nrc
		teacher
		sessions
		subject
		constructor(nrc, teacher, sessions, subject) {
			this.nrc = nrc;
			this.teacher = teacher;
			this.sessions = sessions;
			this.subject = subject;
		}
	}
	class ScheduleC {
		owner
		sections
		constructor(owner, sections) {
			this.owner = owner;
			this.sections = sections;
		}
	}
	// Description: Archivo de funciones para el manejo de archivos


	function mismaMateria(Section1, Section2) {
		if (Section1.subject === Section2.subject) {
			return true;
		}
		return false;
	}

	function sonCompatibles(section1, section2) {
		for (let i = 0; i < section1.sessions.length; i++) {
			for (let j = 0; j < section2.sessions.length; j++) {
				if (section1.sessions[i].day === section2.sessions[j].day) {
					if (section1.sessions[i].start >= section2.sessions[j].start && section1.sessions[i].start <= section2.sessions[j].end) {
						return false;
					}
					if (section1.sessions[i].end >= section2.sessions[j].start && section1.sessions[i].end <= section2.sessions[j].end) {
						return false;
					}
				}
			}
		}
		return true;
	}
	function obtenerMaterias(sections) {
		let materias = new Array();
		const materiaInicial = new SubjectC(sections[0].subject.name, [sections[0]], sections[0].subject.career);
		materias.push(materiaInicial);
		let booleano = true;
		for(let i = 1; i < sections.length; i++) {
			booleano = false;
			for (let j = 0; j < materias.length; j++) {
				if (mismaMateria(sections[i], materias[j].sections[0])) {
					materias[j].sections.push(sections[i]);
					booleano = true;
					break;
				}
			}
			if (!booleano) {
				const materia = new SubjectC(sections[i].subject.name, [sections[i]], sections[i].subject.career);
				materias.push(materia);
			}
		}
		return materias;
	}

	function compararScheduleSection(schedule, newSection) {
		let booleano = true;
		schedule.sections.forEach(section => {
			if (!sonCompatibles(section, newSection)) {
				booleano = false;
			}
		});
		return booleano;
	}

	function recursiveSchedulePush(index, materias, schedule, schedules){
		const temp = new ScheduleC(schedule.owner, []);
		for (let i = 0; i < schedule.sections.length; i++) {
			temp.sections.push(schedule.sections[i]);
		}
		if (index === materias.length) {
			if (temp.sections.length === materias.length) {
				schedules.push(temp);
			}
			return;
		}
		for (let i = 0 ; i < materias[index].sections.length; i++) {
			let booleano = false;
			if (compararScheduleSection(temp, materias[index].sections[i])) {
				temp.sections.push(materias[index].sections[i]);
				booleano = true;
			}
			recursiveSchedulePush(index+1, materias, temp, schedules);
			if (booleano){
				temp.sections.pop();
			}
		}
	}

	function sortSubjectsBySectionLength(subjects) {
		return subjects.sort((a, b) => a.sections.length - b.sections.length);
	}
	function getSchedules(owner, sections) {
		let materias = obtenerMaterias(sections)
		materias = sortSubjectsBySectionLength(materias);
		let schedules = new Array();
		const scheduleInicial = new ScheduleC(owner, []);
		recursiveSchedulePush(0, materias, scheduleInicial, schedules);
		schedules = schedules.filter((schedule) => materias.length == schedule.sections.length);
		return schedules;
	}




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
export function schedulesRoutes(app) {
	app.get("/api/schedules/generate_schedules", async (req, res) => {
		const owner = req.query.owner;
		const nrcs = req.query.nrcs;

		if (owner === undefined || nrcs === undefined) {
			console.log("FAILED TO GENERATE SCHEDULES: A value is undefined");
			res.send(undefined);
			return;
		}

		const failed = false;
		let sections = await Promise.all(
			nrcs.split(",").map(async (nrc) => {
				return await Section.find({ nrc: nrc });
			}),
		);
		sections = sections.flat();

		const schedules = await GenerateSchedules(
			sections,
			[...new Set(sections.map((section) => section.subject.toString()))]
				.length,
		);
		console.log(schedules);
		res.send(schedules);
	});
// export function schedulesRoutes(app) {
// 	app.get("/api/schedules/generate_schedules", async (req, res) => {
// 		const owner = req.query.owner;
// 		const sectionsNRC = req.query.sectionsNrc;

// 		if (owner === undefined || sectionsNRC === undefined) {
// 			console.log("FAILED TO GENERATE SCHEDULES: A value is undefined");
// 			res.send(undefined);
// 			return;
// 		}

// 		const failed = false;
// 		let sections = await Promise.all(
// 			sectionsNRC.split(",").map(async (nrc) => {
// 				return await Section.find({ nrc: nrc }).populate("sessions").populate("subject").exec();
// 			}),
// 		);
// 		sections = sections.flat();
		
// 		console.log(sections);

// 		let schedules = getSchedules(owner, sections);
// 		schedules=schedules.map( (schedule) => {
// 			return schedule.sections;
// 		});
// 		console.log("Aquí lo que mando");
// 		console.log(schedules);
// 		res.send(schedules);
		
// 	});

	app.get("/api/schedules/save_schedule", async (req, res) => {
		const owner = req.query.owner;
		let nrcs = req.query.nrcs;

		if (owner === undefined || nrcs === undefined) {
			console.log("FAILED TO SAVE SCHEDULE: A value is undefined");
			res.send(undefined);
			return;
		}

		nrcs = nrcs.split(",");

		const newSchedule = await new Schedule({
			_id: new mongoose.mongo.ObjectId(),
			owner: owner,
			sections: await Promise.all(
				nrcs.map(async (nrc) => {
					return await Section.findOne({ nrc: nrc });
				}),
			),
		});

		const schedule = await Schedule.findOne({ owner: owner });
		if (schedule !== undefined) {
			await Schedule.deleteOne(schedule);
		}
		await newSchedule.save();

		res.send(newSchedule);
	});

	app.get("/api/schedule/get_schedule_from_id", async (req, res) => {
		if (req.query.id === undefined) {
			res.send(undefined);
			return;
		}

		const schedule = await Schedule.findById(req.query.id);
		if (schedule === undefined) {
			res.send(undefined);
			return;
		}

		res.send(schedule);
	});

	app.get("/api/schedule/get_schedule_from_owner", async (req, res) => {
		if (req.query.owner === undefined) {
			res.send(undefined);
			return;
		}

		const schedule = await Schedule.findOne({ owner: req.query.owner });
		if (schedule === undefined) {
			res.send(undefined);
			return;
		}

		console.log(schedule);
		res.send(schedule);
	});
}

import { Section, Session, Subject, Schedule } from "./classes";
// Description: Archivo de funciones para el manejo de archivos

function mismaMateria(section1: Section, section2: Section) {
	if (section1.subject === section2.subject) {
		return true;
	}
	return false;
}

function sonCompatibles(section1: Section, section2: Section) {
	for (let i = 0; i < section1.sessions.length; i++) {
		for (let j = 0; j < section2.sessions.length; j++) {
			if (section1.sessions[i].day === section2.sessions[j].day) {
				if (
					section1.sessions[i].start >= section2.sessions[j].start &&
					section1.sessions[i].start <= section2.sessions[j].end
				) {
					return false;
				}
				if (
					section1.sessions[i].end >= section2.sessions[j].start &&
					section1.sessions[i].end <= section2.sessions[j].end
				) {
					return false;
				}
			}
		}
	}
	return true;
}
function obtenerMaterias(sections: Section[]) {
	const materias = new Array();
	const materiaInicial = new Subject(
		sections[0].subject.name,
		[sections[0]],
		sections[0].subject.career,
	);
	materias.push(materiaInicial);
	let booleano = true;
	for (let i = 1; i < sections.length; i++) {
		booleano = false;
		for (let j = 0; j < materias.length; j++) {
			if (mismaMateria(sections[i], materias[j].sections[0])) {
				materias[j].sections.push(sections[i]);
				booleano = true;
				break;
			}
		}
		if (!booleano) {
			const materia = new Subject(
				sections[i].subject.name,
				[sections[i]],
				sections[i].subject.career,
			);
			materias.push(materia);
		}
	}
	return materias;
}

function compararScheduleSection(schedule: Schedule, newSection: Section) {
	let booleano = true;
	schedule.sections.forEach((section) => {
		if (!sonCompatibles(section, newSection)) {
			booleano = false;
		}
	});
	return booleano;
}

function recursiveSchedulePush(
	index: number,
	materias: Subject[],
	schedule: Schedule,
	schedules: Schedule[],
) {
	const temp = new Schedule(schedule.owner, []);
	for (let i = 0; i < schedule.sections.length; i++) {
		temp.sections.push(schedule.sections[i]);
	}
	if (index === materias.length) {
		if (temp.sections.length === materias.length) {
			schedules.push(temp);
		}
		return;
	}
	for (let i = 0; i < materias[index].sections.length; i++) {
		let booleano = false;
		if (compararScheduleSection(temp, materias[index].sections[i])) {
			temp.sections.push(materias[index].sections[i]);
			booleano = true;
		}
		recursiveSchedulePush(index + 1, materias, temp, schedules);
		if (booleano) {
			temp.sections.pop();
		}
	}
}

function sortSubjectsBySectionLength(subjects: Subject[]) {
	return subjects.sort((a, b) => a.sections.length - b.sections.length);
}
function filtrarHorariosPorMaterias(
	schedules: Schedule[],
	materias: Subject[],
) {
	for (let i = 0; i < schedules.length; i++) {
		if (schedules[i].sections.length !== materias.length) {
			schedules.splice(i, 1);
			i--;
		}
	}
	return schedules;
}
export function getSchedules(owner: string, sections: Section[]) {
	let materias = obtenerMaterias(sections);
	materias = sortSubjectsBySectionLength(materias);
	let schedules = new Array();
	const scheduleInicial = new Schedule(owner, []);
	recursiveSchedulePush(0, materias, scheduleInicial, schedules);
	schedules = filtrarHorariosPorMaterias(schedules, materias);
	return schedules;
}
function main() {
	const fecha1 = new Date(2024, 1, 1, 8, 0);
	const fecha2 = new Date(2024, 1, 1, 10, 0);
	const fecha3 = new Date(2024, 1, 1, 9, 0);
	const fecha4 = new Date(2024, 1, 1, 11, 0);
	const fecha5 = new Date(2024, 1, 3, 9, 0);
	const fecha6 = new Date(2024, 1, 3, 11, 0);
	const fecha7 = new Date(2024, 1, 1, 12, 0);
	const fecha8 = new Date(2024, 1, 1, 14, 0);
	const fecha9 = new Date(2024, 1, 1, 9, 0);
	const fecha10 = new Date(2024, 1, 1, 11, 0);

	const session1 = new Session(fecha1, fecha2, 1);
	const session2 = new Session(fecha3, fecha4, 1);
	const session3 = new Session(fecha5, fecha6, 3);
	const session4 = new Session(fecha7, fecha8, 1);
	const session5 = new Session(fecha9, fecha10, 1);

	const subject1 = new Subject("Matematica", [], "ing");
	const subject2 = new Subject("Fisica", [], "ing");

	const section1 = new Section(1, "teacher1", [], subject1);
	const section2 = new Section(2, "teacher2", [], subject2);
	const section3 = new Section(3, "teacher3", [], subject1);

	section1.sessions = [session1, session2];
	section2.sessions = [session3, session4];
	section3.sessions = [session5];

	const sections = [section1, section3];

	const a = getSchedules("owner", sections);

	console.log(a);
}
main();

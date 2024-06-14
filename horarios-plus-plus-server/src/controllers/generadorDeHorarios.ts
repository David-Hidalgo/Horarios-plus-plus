import { Section, Session, Subject, Schedule, User } from "../models/classes";
// Description: Archivo de funciones para el manejo de archivos









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

	const a = User.getSchedules("owner", sections);

	console.log(a);
}
main();

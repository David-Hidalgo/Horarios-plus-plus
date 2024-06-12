import mongoose from "mongoose";
import {
	SectionModel,
	SessionModel,
	UserModel,
	SubjectModel,
} from "./../models/schemas";
import type {
	iSection,
	iSchedule,
	iSession,
	iSubject,
} from "./../models/classes";

run().catch((err) => console.log(err));

import { getSchedules } from "./generadorDeHorarios";

function createSchedule(sections: iSection[]): iSchedule {
	const user = new UserModel({
		name: "Bill",
		email: "bill@initech.com",
		avatar: "https://i.imgur.com/dM7Thhn.png",
	});
	const amigo = getSchedules(user.name, sections);
	return amigo[0];
}

async function run() {
	// 4. Connect to MongoDB
	await mongoose.connect("mongodb://127.0.0.1:27017/horariospp");

	mongoose.disconnect();
}

function addSubject(subject: iSubject) {
	mongoose.connect("mongodb://127.0.0.1:27017/horariospp");
	const subjectModelDoc = new SubjectModel(subject);
	subjectModelDoc.save();
	mongoose.disconnect();
}

function addSession(section1: iSection) {
	mongoose.connect("mongodb://127.0.0.1:27017/horariospp");
	const session: iSession = new SessionModel({
		day: "Lunes",
		start: 7,
		end: 9,
	});
	section1.sessions.push(session);
	SectionModel.findOneAndUpdate({ nrc: section1.nrc }, section1);
	mongoose.disconnect();
}

import mongoose from "mongoose";
import { Schedule, Subject, Section, Session } from "../models/models.js";

export function sectionRoutes(app) {
	app.get("/api/section/get_sections_from_id", async (req, res) => {
		if (req.query.id === undefined) {
			console.log("GET_SECTIONS_FROM_ID ERROR: id is undefined");
			res.send(undefined);
			return;
		}

		const section = await Section.findById(req.query.id);
		if (section === undefined) {
			console.log("GET_SECTIONS_FROM_ID ERROR: no section has this id: ", req.query.id);
			res.send(undefined);
			return;
		}
		res.send(section);
	});

	app.get("/api/section/get_sections_from_subject", async (req, res) => {
		if (req.query.subjectName === undefined) {
			res.send(undefined);
			return;
		}

		const subject = (await Subject.find({ name: req.query.subjectName })).at(0);
		if (subject === undefined) {
			res.send(undefined);
			return;
		}

		res.send(subject.sections);
	});

	app.get("/api/section/add_section_to_subject", async (req, res) => {
		if (
			req.query.nrc === undefined ||
			req.query.teacher === undefined ||
			req.query.subjectName === undefined
		) {
			console.log("Alguno de los argumentos es undefined");
			res.send(undefined);
			return;
		}

		if (await Section.exists({ nrc: req.query.nrc })) {
			console.log(
				`El NRC ya se encuentra en la base de datos ${req.query.nrc}`,
			);
			res.send(undefined);
			return;
		}

		const subject = (await Subject.find({ name: req.query.subjectName })).at(0);
		if (subject === undefined) {
			console.log(`No se encontro ${req.query.subjectName}`);
			res.send(undefined);
			return;
		}

		const newSection = new Section({
			_id: new mongoose.mongo.ObjectId(),
			nrc: `${req.query.nrc}`,
			teacher: `${req.query.teacher}`,
			subject: new mongoose.mongo.ObjectId(subject._id),
			sessions: [],
		});
		await newSection.save();
		await Subject.findOneAndUpdate(subject, {
			sections: subject.sections.concat(newSection),
		});

		res.send(newSection);
	});

	app.get("/api/section/update_section", async (req, res) => {
		const oldNRC = req.query.oldnrc;
		if (oldNRC === undefined) {
			console.log("Could not update section, OLDNRC is undefined");
			res.send(undefined);
			return;
		}

		if (oldNRC !== req.query.nrc){
			if (await Section.exists({ nrc: req.query.nrc })) {
				console.log(
					`El NRC ya se encuentra en la base de datos ${req.query.nrc}`,
				);
				res.send(undefined);
				return;
			}
		}

		const filter = { nrc: oldNRC };
		const newSection = {
			nrc: `${req.query.nrc}`,
			teacher: `${req.query.teacher}`,
		};
		const oldSection = await Section.findOneAndUpdate(filter, newSection);
		if (oldSection === undefined) {
			console.log("Could not find and update oldNRC: ", oldNRC);
			res.send(oldSection);
			return;
		}

		console.log("Updated section ", oldSection, " to ", newSection);
		res.send(newSection);
	});

	app.delete("/api/section/delete_section", async (req, res) => {
		const toDeleteNRC = req.query.nrc;
		if (toDeleteNRC === undefined) {
			console.log("DELETE_SECTION ERROR: nrc is undefined ", toDeleteNRC);
			res.send(undefined);
			return;
		}

		const section = await Section.findOne({ nrc: toDeleteNRC });
		if (section === undefined) {
			console.log("DELETE_SECTION ERROR: no section has nrc ", toDeleteNRC);
			res.send(undefined);
			return;
		}

		const schedules = await Schedule.find();
		schedules.forEach(async (schedule) => {
			if (schedule.sections.some((x) => x.equals(section._id))) {
				await Schedule.deleteOne(schedule);
			}
		});

		const subject = await Subject.findById({
			_id: new mongoose.mongo.ObjectId(section.subject),
		});
		console.log("Subject: ", subject);
		if (subject !== undefined|| subject !== null) {
			await Subject.findOneAndUpdate(
				{ _id: new mongoose.mongo.ObjectId(subject._id) },
				{ sections: subject.sections.filter((id) => !id.equals(section.id)) },
			);
		}

		section.sessions.forEach(async (session) => {
			await Session.deleteOne({ _id: new mongoose.mongo.ObjectId(session) });
		});
		const response = await Section.deleteOne({ nrc: toDeleteNRC });
		res.send(response);
	});
}

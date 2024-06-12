import mongoose from "mongoose";
import {
	ScheduleModel,
	SubjectModel,
	SectionModel,
	SessionModel,
} from "../../models/schemas";
import Elysia from "elysia";

export const pluginSection = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		name: "sectionRoutes",
		seed: config,
	})
		.get(`${config.prefix}/hi`, () => "Hi")
		.get("/api/section/get_sections_from_id", async (req, res) => {
			if (req.query.id === undefined) {
				res.send(undefined);
				return;
			}

			const section = await SectionModel.findById(req.query.id);
			if (section === undefined) {
				res.send(undefined);
				return;
			}

			res.send(section);
		})
		.get("/api/section/get_sections_from_subject", async (req, res) => {
			if (req.query.subjectName === undefined) {
				res.send(undefined);
				return;
			}

			const subject = (
				await SubjectModel.find({ name: req.query.subjectName })
			).at(0);
			if (subject === undefined) {
				res.send(undefined);
				return;
			}

			res.send(subject.sections);
		})
		.get("/api/section/add_section_to_subject", async (req, res) => {
			if (
				req.query.nrc === undefined ||
				req.query.teacher === undefined ||
				req.query.subjectName === undefined
			) {
				console.log("Alguno de los argumentos es undefined");
				res.send(undefined);
				return;
			}

			if (await SectionModel.exists({ nrc: req.query.nrc })) {
				console.log(
					`El NRC ya se encuentra en la base de datos ${req.query.nrc}`,
				);
				res.send(undefined);
				return;
			}

			const subject = (
				await SubjectModel.find({ name: req.query.subjectName })
			).at(0);
			if (subject === undefined) {
				console.log(`No se encontro ${req.query.subjectName}`);
				res.send(undefined);
				return;
			}

			const newSection = new SectionModel({
				_id: new mongoose.mongo.ObjectId(),
				nrc: `${req.query.nrc}`,
				teacher: `${req.query.teacher}`,
				subject: new mongoose.mongo.ObjectId(subject._id),
				sessions: [],
			});
			await newSection.save();
			await SubjectModel.findOneAndUpdate(subject, {
				sections: subject.sections.concat(newSection),
			});

			res.send(newSection);
		})
		.get("/api/section/update_section", async (req, res) => {
			const oldNRC = req.query.oldnrc;
			if (oldNRC === undefined) {
				console.log("Could not update section, OLDNRC is undefined");
				res.send(undefined);
				return;
			}

			if (await SectionModel.exists({ nrc: req.query.nrc })) {
				console.log(
					`El NRC ya se encuentra en la base de datos ${req.query.nrc}`,
				);
				res.send(undefined);
				return;
			}

			const filter = { nrc: oldNRC };
			const newSection = {
				nrc: `${req.query.nrc}`,
				teacher: `${req.query.teacher}`,
			};
			const oldSection = await SectionModel.findOneAndUpdate(
				filter,
				newSection,
			);
			if (oldSection === undefined) {
				console.log("Could not find and update oldNRC: ", oldNRC);
				res.send(oldSection);
				return;
			}

			console.log("Updated section ", oldSection, " to ", newSection);
			res.send(newSection);
		})
		.get("/api/section/delete_section", async (req, res) => {
			const toDeleteNRC = req.query.nrc;
			if (toDeleteNRC === undefined) {
				console.log("DELETE_SECTION ERROR: nrc is undefined ", toDeleteNRC);
				res.send(undefined);
				return;
			}

			const section = await SectionModel.findOne({ nrc: toDeleteNRC });
			if (section === undefined) {
				console.log("DELETE_SECTION ERROR: no section has nrc ", toDeleteNRC);
				res.send(undefined);
				return;
			}

			const schedules = await ScheduleModel.find();
			schedules.forEach(async (schedule) => {
				if (schedule.sections.some((x) => x.equals(section._id))) {
					await ScheduleModel.deleteOne(schedule);
				}
			});

			const subject = await SubjectModel.findById({
				_id: new mongoose.mongo.ObjectId(section.subject),
			});
			if (subject !== undefined) {
				await SubjectModel.findOneAndUpdate(
					{ _id: new mongoose.mongo.ObjectId(subject._id) },
					{ sections: subject.sections.filter((id) => !id.equals(section.id)) },
				);
			}

			section.sessions.forEach(async (session) => {
				await SessionModel.deleteOne({
					_id: new mongoose.mongo.ObjectId(session),
				});
			});
			const response = await SectionModel.deleteOne({ nrc: toDeleteNRC });
			res.send(response);
		});

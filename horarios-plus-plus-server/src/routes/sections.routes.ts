import mongoose from "mongoose";
import {
	ScheduleModel,
	SubjectModel,
	SectionModel,
	SessionModel,
} from "../models/schemas";
import Elysia from "elysia";

export const pluginSection = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		name: "sectionRoutes",
		seed: config,
	})
		.get(`${config.prefix}/hi`, () => "Hi")
		.get("/api/section/get_sections_from_id", async ({query}) => {
			if (query.id === undefined) {
				return(undefined);
			}

			const section = await SectionModel.findById(query.id);
			if (section === undefined) {
				return(undefined);
				
			}

			return(section);
		})
		.get("/api/section/get_sections_from_subject", async ({query}) => {
			if (query.subjectName === undefined) {
				return(undefined);
				
			}

			const subject = (
				await SubjectModel.find({ name: query.subjectName })
			).at(0);
			if (subject === undefined) {
				return(undefined);
				
			}

			return(subject.sections);
		})
		.get("/api/section/add_section_to_subject", async ({query}) => {
			if (
				query.nrc === undefined ||
				query.teacher === undefined ||
				query.subjectName === undefined
			) {
				console.log("Alguno de los argumentos es undefined");
				return(undefined);
				
			}

			if (await SectionModel.exists({ nrc: query.nrc })) {
				console.log(
					`El NRC ya se encuentra en la base de datos ${query.nrc}`,
				);
				return(undefined);
				
			}

			const subject = (
				await SubjectModel.find({ name: query.subjectName })
			).at(0);
			if (subject === undefined) {
				console.log(`No se encontro ${query.subjectName}`);
				return(undefined);
				
			}

			const newSection = new SectionModel({
				_id: new mongoose.mongo.ObjectId(),
				nrc: `${query.nrc}`,
				teacher: `${query.teacher}`,
				subject: new mongoose.mongo.ObjectId(subject._id),
				sessions: [],
			});
			await newSection.save();
			await SubjectModel.findOneAndUpdate(subject, {
				sections: subject.sections.concat(newSection),
			});

			return(newSection);
		})
		.get("/api/section/update_section", async ({query}) => {
			const oldNRC = query.oldnrc;
			if (oldNRC === undefined) {
				console.log("Could not update section, OLDNRC is undefined");
				return(undefined);
				
			}

			if (await SectionModel.exists({ nrc: query.nrc })) {
				console.log(
					`El NRC ya se encuentra en la base de datos ${query.nrc}`,
				);
				return(undefined);
				
			}

			const filter = { nrc: oldNRC };
			const newSection = {
				nrc: `${query.nrc}`,
				teacher: `${query.teacher}`,
			};
			const oldSection = await SectionModel.findOneAndUpdate(
				filter,
				newSection,
			);
			if (oldSection === undefined) {
				console.log("Could not find and update oldNRC: ", oldNRC);
				return(oldSection);
				
			}

			console.log("Updated section ", oldSection, " to ", newSection);
			return(newSection);
		})
		.get("/api/section/delete_section", async ({query}) => {
			const toDeleteNRC = query.nrc;
			if (toDeleteNRC === undefined) {
				console.log("DELETE_SECTION ERROR: nrc is undefined ", toDeleteNRC);
				return(undefined);
				
			}

			const section = await SectionModel.findOne({ nrc: toDeleteNRC });
			if (section === undefined || section === null) {
				console.log("DELETE_SECTION ERROR: no section has nrc ", toDeleteNRC);
				return(undefined);
				
			}

			const schedules = await ScheduleModel.find();
			schedules.forEach(async (schedule) => {
				if(schedule.sections != null && schedule != null) {
					if (schedule.sections.some((x) => x.equals(section._id))) {
						await ScheduleModel.deleteOne(schedule);
					}
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
			return(response);
		});

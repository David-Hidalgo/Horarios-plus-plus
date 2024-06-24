import mongoose from "mongoose";
import type { DBController } from "../controllers/db";
import Elysia from "elysia";
import { iSession, Section, type Subject } from "../models/classes";

export function plugginSessiones(db:DBController) {
	const pluginSession = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		name: "my-plugin",
		seed: config,
	})
		.get(`${config.prefix}/hi`, () => "Hi")

		.get("/api/session/get_sessions_from_id", async ({query}) => {
			if (query.id === undefined) {
				return(undefined);
				
			}

			const session = await db.sessionModel.findById(query.id);
			if (session === undefined) {
				return(undefined);
				
			}

			return(session);
		})

		.get("/api/session/get_sessions_from_section", async ({query}) => {
			if (query.nrc === undefined) {
				return(undefined);
				
			}

			const section = (await db.sectionModel.find({ nrc: query.nrc })).at(0);
			if (section === undefined) {
				return(undefined);
				
			}

			return(section.sessions);
		})

		.post("/api/session/add_session_to_section", async ({query}) => {
			if (
				query.day === undefined ||
				query.start === undefined ||
				query.end === undefined
			) {
				console.log("Alguno de los argumentos es undefined");
				return(undefined);
				
			}

			const section = (await db.sectionModel.find({ nrc: query.nrc })).at(0);
			if (section === undefined) {
				console.log(`No se encontro ${query.nrc}`);
				return(undefined);
			}

			const newSession = new db.sessionModel({
				day: 0,
				start: query.start,
				end: query.end,
			});
			
			section.sessions.push(newSession);
			section.save();
			return(newSession);
		})

		.post("/api/session/updateSession", async ({query}) => {
			const oldDay = query.oldday;
			const oldStart = query.oldstart;
			const oldEnd = query.oldend;

			const newDay = query.newday;
			const newStart = query.newstart;
			const newEnd = query.newend;

			const oldSession = { day: oldDay, start: oldStart, end: oldEnd };

			if (
				oldDay === undefined ||
				oldStart === undefined ||
				oldEnd === undefined ||
				newDay === undefined ||
				newStart === undefined ||
				newEnd === undefined ||
				query.nrc === undefined
			) {
				console.log(
					"Could not update session, one of the arguments is undefined",
				);
				return(undefined);
				
			}

			const newSession = { day: newDay, start: newStart, end: newEnd };
			if (await db.sessionModel.exists({ ...newSession, nrc: query.nrc })) {
				console.log("An identical session already exists");
				return(undefined);
				
			}

			const section = await db.sectionModel.findOne({ nrc: query.nrc });
			if (section === undefined) {
				console.log("No section with nrc ", query.nrc, " exists");
				return(undefined);
				
			}

			const oldSessionObject = await db.sessionModel.findOneAndUpdate(
				{ ...oldSession, section: new mongoose.mongo.ObjectId(section._id) },
				newSession,
			);
			if (oldSessionObject === undefined) {
				console.log("Could not find and update oldSession: ", oldSession);
				return(undefined);
				
			}

			console.log("Updated session ", oldSessionObject, " to ", newSession);
			return(newSession);
		})

		.delete("/api/session/delete_session", async ({query}) => {
			const sectionNRC = query.nrc;
			const dayToDelete = query.day;
			const startToDelete = query.start;
			const endToDelete = query.end;

			const toDeleteSession = {
				day: dayToDelete,
				start: startToDelete,
				end: endToDelete,
			};

			if (
				dayToDelete === undefined ||
				startToDelete === undefined ||
				endToDelete === undefined ||
				sectionNRC === undefined
			) {
				console.error(
					"DELETE_SESSION ERROR: an item is undefined ",
					toDeleteSession,
				);
				return(undefined);
				
			}

			const section = await db.sectionModel.findOne({ nrc: sectionNRC });
			if (section !== undefined &&  section!==null) {
				const subject = new Array<Subject>();
				const seccion = new Section(section.nrc, section?.teacher, section?.sessions, subject);
			}else{
				console.log("DELETE_SECSION ERROR: no section has nrc ", sectionNRC);
				return(undefined);	
			}


			const session = await db.sessionModel.findOne({
				toDeleteSession,
			});
			if (session === undefined) {
				console.log("DELETE_SESSION ERROR: doesn't exist ", toDeleteSession);
				return(undefined);
			}

			await db.deleteSessionFromSection(sectionNRC, session);

			const response = await db.sessionModel.deleteOne(session);
			return(response);
		});
	return pluginSession;
}

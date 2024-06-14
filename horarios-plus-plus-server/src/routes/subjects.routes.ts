import mongoose from "mongoose";
import { SubjectModel } from "../models/schemas";
import Elysia, { t } from "elysia";

export const pluginSection = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		name: "userRoutes",
		seed: config,
	})
	.get("/api/subjects/get_subjects", async ({query}) => {
		const subject_list = await SubjectModel.find({});
		return(subject_list);
	})
	.get("/api/subjects/create_subject", async ({query}) => {
		let saved = false;
		const newSubject = new SubjectModel({
			_id: new mongoose.mongo.ObjectId(),
			name: query.name,
			sections: [],
			careers: [],
		});
		try {
			await newSubject.save();
			saved = true;
		} catch (e) {
			console.error("Failed saving subject ", e);
		} 
		if (saved) {
				return(newSubject)
			}
		return(undefined);
	},{
		query: t.Object({
					name: t.String(),
				}),
	})
	.get("/api/subjects/get_subjects_from_id", async ({query}) => {
		if (query.id === undefined) {
			return(undefined);
			
		}

		const subject = await SubjectModel.findById(query.id);
		if (subject === undefined) {
			return(undefined);
		}

		return(subject);
	},{
		query: t.Object({
					id: t.String(),
				}),
	});

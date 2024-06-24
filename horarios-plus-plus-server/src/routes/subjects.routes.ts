import mongoose from "mongoose";
import Elysia, { t } from "elysia";
import type { DBController } from "./../controllers/db";

export const pluginSubject = <T extends string>(
	config: { prefix: T },
	db: DBController,
) =>
	new Elysia({
		name: "userRoutes",
		seed: config,
	})
		.get("/api/subjects/get_subjects", async ({ query }) => {
			const subject_list = await db.subjectModel.find({});
			return subject_list;
		})
		.get(
			"/api/subjects/create_subject",
			async ({ query }) => {
				let saved = false;
				const newSubject = new db.subjectModel({
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
					return newSubject;
				}
				return undefined;
			},
			{
				query: t.Object({
					name: t.String(),
				}),
			},
		)
		.get(
			"/api/subjects/get_subjects_from_id",
			async ({ query }) => {
				if (query.id === undefined) {
					return undefined;
				}

				const subject = await db.subjectModel.findById(query.id);
				if (subject === undefined) {
					return undefined;
				}

				return subject;
			},
			{
				query: t.Object({
					id: t.String(),
				}),
			},
		);

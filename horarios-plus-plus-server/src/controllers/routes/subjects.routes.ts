import mongoose from "mongoose";
import { SubjectModel } from "../../models/schemas";

export function subjectRoutes(app) {
	app.get("/api/subjects/get_subjects", async (req, res) => {
		const subject_list = await SubjectModel.find({});
		res.send(subject_list);
	});
	app.get("/api/subjects/create_subject", async (req, res) => {
		let saved = false;
		const newSubject = new SubjectModel({
			_id: new mongoose.mongo.ObjectId(),
			name: `${req.query.name}`,
			sections: [],
			careers: [],
		});
		try {
			await newSubject.save();
			saved = true;
		} catch (e) {
			console.error("Failed saving subject ", e);
		} finally {
			if (saved) res.send(newSubject);
			else res.send(undefined);
		}
	});
	app.get("/api/subjects/get_subjects_from_id", async (req, res) => {
		if (req.query.id === undefined) {
			res.send(undefined);
			return;
		}

		const subject = await SubjectModel.findById(req.query.id);
		if (subject === undefined) {
			res.send(undefined);
			return;
		}

		res.send(subject);
	});
}

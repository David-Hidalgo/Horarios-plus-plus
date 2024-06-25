import mongoose from "mongoose";
import { Subject, Section } from "../models/models.js";

export function subjectRoutes(app) {
	app.get("/api/subjects/get_subjects", async (req, res) => {

		const subject_list = await Subject.find({});
		res.send(subject_list);
	});
	app.get("/api/subjects/create_subject", async (req, res) => {
		let saved = false;
		if (req.query.name === undefined) {
			console.log("Could not create subject, NAME is undefined");
			res.send(undefined);
			return;
		}
		const newSubject = new Subject({
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
	app.get("/api/subjects/delete_subject", async (req, res) => {
		if (req.query.subject === undefined) {
			console.log("Could not delete subject, SUBJECT is undefined");
			res.send(undefined);
			return;
		}
		
		const subject = await Subject.findOne({ name: req.query.subjectName });
		if (subject === undefined) {
			console.log(`No se encontro ${req.query.subjectName}`);
			res.send(undefined);
			return;
		}
		const sectionsIds = subject.sections.map((section) => section._id);
		// Delete all sections
		sectionsIds.forEach(async (sectionId) => {
			const section = await Section.findById(sectionId);
			if (section === undefined) {
				console.log(`No se encontro ${sectionId}`);
				return;
			}
			try {
				await section.deleteOne();
				console.log(`Deleted section successfully`);
			} catch (e) {
				console.error("Failed deleting section ", e);
				return;
			}})

		try {
			await subject.deleteOne();
			res.send({message: "Subject deleted successfully"});
		} catch (e) {
			console.error("Failed deleting subject ", e);
			res.send(undefined);
			return;
		}
		return;
	});
	app.get("/api/subjects/update_subject", async (req, res) => {
		const oldName = req.query.oldname;
		const newName = req.query.newname;
		if (oldName === undefined) {
			console.log("Could not update subject, OLDNAME is undefined");
			res.send(undefined);
			return;
		}
		if (newName === undefined) {
			console.log("Could not update subject, NEWNAME is undefined");
			res.send(undefined);
			return;
		}


		const filter = { name: oldName };
		const newSubject = {name: newName};
		const oldSubject = await Subject.findOneAndUpdate(filter, newSubject);
		if (oldSubject === undefined) {
			console.log("Could not find and update oldName: ", oldName);
			res.send(oldSubject);
			return;
		}
		console.log("Updated subject ", oldSubject, " to ", newSubject);
		res.send(newSubject);

	});
	app.get("/api/subjects/get_subjects_from_id", async (req, res) => {
		if (req.query.id === undefined) {
			res.send(undefined);
			return;
		}

		const subject = await Subject.findById(req.query.id);
		if (subject === undefined) {
			console.log("Could not find subject with id ", req.query.id);
			res.send(undefined);
			return;
		}

		res.send(subject);
	});
}

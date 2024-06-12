import mongoose from "mongoose";
import { User } from "../models/models.js";

export function userRoutes(app) {
	app.get("/api/sign_up", async (req, res) => {
		let email = req.query.email;
		let password = req.query.password;

		if (email === undefined || password === undefined) {
			console.log("Failed to sign up: A value is undefined");
			res.send(undefined);
			return;
		}

		if (await User.exists({ email: req.query.email })) {
			console.log(
				"El email ya se encuentra en la base de datos " + req.query.email,
			);
			res.send(undefined);
			return;
		}

		const user = await User.create({
			_id: new mongoose.mongo.ObjectId(),
			email: email,
			password: password,
		});
		user.save();

		res.send(user);
		return;
	});

	app.get("/api/login", async function (req, res) {
		try {
			const user = await User.findOne({ email: req.query.email });
			if (user) {
				const result = req.query.password === user.password;
				if (result) {
					res.send({ message: "successful" });
					return;
				} else {
					res.send({ message: "password doesn't match" });
				}
			} else {
				res.send({ message: "User doesn't exist" });
			}
		} catch (error) {
			res.send(undefined);
		}
	});
}

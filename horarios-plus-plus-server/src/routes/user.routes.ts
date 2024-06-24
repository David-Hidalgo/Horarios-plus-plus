import mongoose from "mongoose";
import Elysia, { t } from "elysia";
import type { DBController } from "./../controllers/db";

export const pluginUser = <T extends string>(
	config: { prefix: T },
	db: DBController,
) =>
	new Elysia({
		name: "userRoutes",
		seed: config,
	})
		.get(
			"/api/sign_up",
			async ({ query }) => {
				const email = query.email;
				const password = query.password;

				if (email === undefined || password === undefined) {
					console.log("Failed to sign up: A value is undefined");

					return undefined;
				}

				if (await db.userModel.exists({ email: query.email })) {
					console.log(
						`El email ya se encuentra en la base de datos ${query.email}`,
					);

					return undefined;
				}

				const user = await db.userModel.create({
					_id: new mongoose.mongo.ObjectId(),
					email: email,
					password: password,
				});
				user.save();
				return user;
			},
			{
				query: t.Object({
					email: t.String(),
					password: t.String(),
				}),
			},
		)
		.get(
			"/api/login",
			async ({ query }) => {
				try {
					const user = await db.userModel.findOne({ email: query.email });
					if (user) {
						const result = query.password === user.password;
						if (result) {
							return { message: "successful" };
						}
						return { message: "password doesn't match" };
					}
					return { message: "db.userModel doesn't exist" };
				} catch (error) {
					return undefined;
				}
			},
			{
				query: t.Object({
					email: t.String(),
					password: t.String(),
				}),
			},
		);

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
		.get("api/get_usuarios", async () => {
			const users = await db.userModel.find();
			return JSON.stringify(users);
		})
		.put( "/api/update_types",
			async ({ query }) => {
				const email = query.email;
				const password = query.password;
				const type = query.type;

				if (email === undefined || password === undefined || type === undefined) {
					console.log("Failed to update user: A value is undefined");

					return { message: "Failed to update user: A value is undefined"};
				}

				const user = await db.userModel.findOne({ email: email });

				if (user === null) {
					console.log("Failed to update user: User not found");

					return { message: "Failed to update user: User not found"};
				}

				user.password = password;
				user.tipo = type;
				user.save();

				return { message: "User updated successfully"};
			}
		)
		.put( "/api/update_user",
			async ({ query }) => {
				const email = query.email;
				const password = query.password;
				const type = query.type;

				if (email === undefined || password === undefined || type === undefined) {
					console.log("Failed to update user: A value is undefined");

					return { message: "Failed to update user: A value is undefined"};
				}

				const user = await db.userModel.findOne({ email: email });

				if (user === null) {
					console.log("Failed to update user: User not found");

					return { message: "Failed to update user: User not found"};
				}

				user.password = password;
				user.tipo = type;
				user.save();

				return { message: "User updated successfully"};
			},
			{
				query: t.Object({
					email: t.String(),
					password: t.String(),
					type: t.Number(),
				}),
			},
		)
		.get("/api/sign_up",
			async ({ query }) => {
				const email = query.email;
				const password = query.password;

				if (email === undefined || password === undefined) {
					console.log("Failed to sign up: A value is undefined");

					return { message: "Failed to sign up: A value is undefined"};
				}

				if (await db.userModel.exists({ email: query.email })) {
					console.log(
						`El email ya se encuentra en la base de datos ${query.email}`,
					);

					return { message: "User already exist" };
				}

				const user = new db.userModel({
					email: email,
					password: password,
					type: 0,
				});
				
				user.save();
				return { message: "User created successfully"};
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
							
							console.log(user.tipo);
							return { message: "successful", tipo: user.tipo};
						}
						return { message: "password doesn't match" };
					}
					return { message: "User doesn't exist" };
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

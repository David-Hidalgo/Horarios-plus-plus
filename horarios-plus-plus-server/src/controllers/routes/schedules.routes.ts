// plugin.ts
import { Elysia } from "elysia";

export const plugin = <T extends string>(config: { prefix: T }) =>
	new Elysia({
		name: "my-plugin",
		seed: config,
	}).get(`${config.prefix}/hi`, () => "Hi");

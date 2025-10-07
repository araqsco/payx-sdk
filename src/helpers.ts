import { PayXTypes } from "./types";

export namespace PayXHelpers {
	export function getConfig(options?: PayXTypes.Options) {
		const defaultUrl = "https://store.payx.am/api"
		return {
			baseUrl: options?.baseUrl ?? process.env.PAYX_BASE_URL! ?? defaultUrl,
			username: options?.username ?? process.env.PAYX_USERNAME!,
			password: options?.password ?? process.env.PAYX_PASSWORD!,
			logging: options?.logging ?? Boolean(process.env.PAYX_LOGGING)
		};
	}
}

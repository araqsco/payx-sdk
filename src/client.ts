import { PayXTypes } from "./types";
import { PayXHelpers } from "./helpers";

export const PayX = new Proxy<PayXTypes.Client>({} as PayXTypes.Client, {
	get(_, key) {
		if (typeof key === "symbol") {
			throw new Error("Cannot get a symbol key");
		}
		return async (request: unknown, options?: PayXTypes.Options) => {
			const config = PayXHelpers.getConfig(options);

			const token = await getToken(config);
			const body = JSON.stringify(request);

			if (config.logging) {
				console.debug("PX:path", key);
				console.debug("PX:body", body);
			}
			const response = await fetch(`${config.baseUrl}/Hdm/${key}`, {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			}).then(async (response) => {
				if (!response.ok) {
					if (config.logging) {
						console.error("PX:status", response.status);
					}
					throw new Error(await response.text().catch((e) => e));
				}
				const content = await response.text();
				if (config.logging) {
					console.debug("PX:response", content);
				}
				try {
					return JSON.parse(content);
				} catch {
					if (config.logging) {
						console.debug("PX:not-json");
					}
					return content;
				}
			});

			return response;
		};
	},
});

async function getToken(options: PayXTypes.Options): Promise<string> {
	const response = await fetch(`${options.baseUrl}/Login/LoginUser`, {
		method: "POST",
		body: JSON.stringify({
			username: options.username,
			password: options.password,
		}),
	});
	const authHeader = response.headers.get("Authorization");
	if (!authHeader) {
		throw new Error("No auth header in login response");
	}

	return authHeader;
}

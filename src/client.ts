import { PayXTypes } from "./types";
import { PayXHelpers } from "./helpers";

export const PayX = new Proxy<PayXTypes.Client>({} as PayXTypes.Client, {
	get(_, key) {
		const ns = key.toString()[0].toLocaleUpperCase() + key.toString().slice(1);
		return new Proxy(
			{},
			{
				get(_, key) {
					const method =
						key.toString()[0].toLocaleUpperCase() + key.toString().slice(1);

					const isGet = key.toString().startsWith("get");
					return async (request: unknown, options?: PayXTypes.Options) => {
						const config = PayXHelpers.getConfig(options);

						const token = await getToken(config);
						let response: Promise<Response>;
						if (isGet) {
							if (config.logging) {
								console.debug("PX:path", `${ns}/${method}`);
								console.debug("PX:query", request);
							}
							const params = new URLSearchParams(
								request as Record<string, string>,
							);
							response = fetch(`${config.baseUrl}/${ns}/${method}?${params}`);
						} else {
							const body = JSON.stringify(request);

							if (config.logging) {
								console.debug("PX:path", `${ns}/${method}`);
								console.debug("PX:body", body);
							}
							response = fetch(`${config.baseUrl}/${ns}/${method}`, {
								method: "POST",
								body,
								headers: {
									"Content-Type": "application/json",
									Authorization: token,
								},
							});
						}
						const data = await response.then(async (response) => {
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

						return data;
					};
				},
			},
		);
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

	if (options.logging) {
		console.debug(
			"Got new token",
			authHeader.slice(0, 10) + "".padStart(authHeader.slice(10).length, "*"),
		);
	}

	return authHeader;
}

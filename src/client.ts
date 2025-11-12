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
					const isQuery = key.toString() === "reverseByReceiptId";

					return async (request: unknown, options?: PayXTypes.Options) => {
						const config = PayXHelpers.getConfig(options);

						const token = await getToken(config);
						let url: string;
						let opts: RequestInit;
						if (isGet || isQuery) {
							const params = new URLSearchParams(
								request as Record<string, string>,
							);
							if (config.logging) {
								console.debug("PX:path", `${ns}/${method}`);
								console.debug("PX:query", request);
							}
							url = `${config.baseUrl}/${ns}/${method}?${params}`;
						} else {
							url = `${config.baseUrl}/${ns}/${method}`;
						}

						if (isGet) {
							opts = {
								headers: {
									Authorization: `Bearer ${token}`,
								},
							};
						} else {
							const body = JSON.stringify(request);

							if (config.logging) {
								console.debug("PX:path", `${ns}/${method}`);
								console.debug("PX:body", body);
							}
							opts = {
								method: "POST",
								body,
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${token}`,
								},
							};
						}
						const data = fetch(url, opts).then(async (response) => {
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
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: options.username,
			password: options.password,
		}),
	});
	const authHeader = response.headers.get("Token");
	if (!authHeader) {
		if (options.logging) {
			console.warn("Login Headers", [...response.headers.entries()]);
		}
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

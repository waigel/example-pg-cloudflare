import { Client } from 'pg';

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "HYPERDRIVE" with the variable name you defined.
	MY_HYPERDRIVE: Hyperdrive;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const client = new Client({
			connectionString: env.MY_HYPERDRIVE.connectionString,
		});

		try {
			// Connect to your database
			await client.connect();

			// A very simple test query
			const result = await client.query({ text: 'SELECT * FROM pg_tables' });

			// Clean up the client, ensuring we don't kill the worker before that is
			// completed.
			ctx.waitUntil(client.end());

			// Return result rows as JSON
			return Response.json({ result: result });
		} catch (e) {
			console.log(e);
			if (e instanceof Error) {
				return Response.json({ error: e.message }, { status: 500 });
			}
			return Response.json({ error: 'Unknown error' }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

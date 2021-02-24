import { RestClient } from './restClient';

import type { Client } from '../client/client';
import type { GETGateway, GETGatewayBot } from '../utils/types';

export class RestHelper extends RestClient {
	public constructor(client: Client, token: string) {
		super(client, token);
	}

	// GET Requests
	public async GETGateway(): Promise<GETGateway> {
		return this.get({
			path: '/gateway',
		});
	}

	public async GETGatewayBot(): Promise<GETGatewayBot> {
		return this.get({
			requiresAuth: true,
			path: '/gateway/bot',
		});
	}
}

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants';
import { mergeDefault } from '../utils/mergeDefault';
import { RestHelper } from '../rest/restHelper';
import { WebsocketClient } from '../websocket/websocketClient';

import type { ClientOptions } from '../utils/types';

export class Client extends EventEmitter {
	public readonly logger: Logger;
	public readonly rest: RestHelper;
	public readonly options: ClientOptions;
	public readonly ws: WebsocketClient;

	private readonly _token: string;

	public constructor(token: string, options: ClientOptions) {
		super();
		this._token = token;

		this.options = mergeDefault(Constants.defaults.clientOptions, options);
		this.logger = new Logger(this);
		this.rest = new RestHelper(this, this._token);
		this.ws = new WebsocketClient(this, this._token);
	}

	public connect(): void {
		this.ws.connect();
	}
}

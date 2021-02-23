import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants';
import { RestClient } from '../rest/restClient';

import type { ClientOptions } from '../utils/types';
import { mergeDefault } from '../utils/mergeDefault';

export class Client extends EventEmitter {
	public readonly logger: Logger;
	public readonly rest: RestClient;
	public readonly options: ClientOptions;

	private readonly _token: string;

	public constructor(token: string, options: ClientOptions = {}) {
		super();

		this._token = token;

		this.options = mergeDefault(Constants.defaults.clientOptions, options);
		this.logger = new Logger(this);
		this.rest = new RestClient(this, this._token);
	}
}

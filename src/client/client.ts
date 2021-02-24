import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { Constants } from '../utils/constants';
import { mergeDefault } from '../utils/mergeDefault';
import { RestHelper } from '../rest/restHelper';

import type { ClientOptions } from '../utils/types';

export class Client extends EventEmitter {
	public readonly logger: Logger;
	public readonly rest: RestHelper;
	public readonly options: ClientOptions;

	private readonly _token: string;

	public constructor(token: string, options: ClientOptions = {}) {
		super();

		this._token = token;

		this.options = mergeDefault(Constants.defaults.clientOptions, options);
		this.logger = new Logger(this);
		this.rest = new RestHelper(this, this._token);
	}
}

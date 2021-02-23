import path from 'path';
import { createLogger, transports, format, config, addColors } from 'winston';

import type { Logger as WinstonLogger } from 'winston';
import type { Client } from '../client/client';

export class Logger {
	private readonly _logger: WinstonLogger;
	private readonly _client: Client;

	public constructor(client: Client) {
		this._client = client;

		addColors(config.syslog.colors);

		this._logger = createLogger({
			levels: config.syslog.levels,
			level: 'debug',
			exitOnError: false,
			transports: [
				new transports.Console(),
			],
			format: format.combine(
				format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				format.prettyPrint({ colorize: true }),
				format.colorize({ all: true, level: true, message: true }),
				format.align(),
				format.errors(),
				format.json(),
				format.splat(),
				format.label({ label: path.basename(require.main!.filename) }),
				format.printf((info) => `${info.label} [${info.timestamp}] (${info.level}): ${info.message}`),
			),
		});
	}

	public debug(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.debug)
			this._logger.log('debug', message, ...args);
	}

	public info(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.info)
			this._logger.log('info', message, ...args);
	}

	public notice(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.notice)
			this._logger.log('notice', message, ...args);
	}

	public warning(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.warning)
			this._logger.log('warning', message, ...args);
	}

	public error(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.error)
			this._logger.log('error', message, ...args);
	}

	public critical(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.critical)
			this._logger.log('crit', message, ...args);
	}

	public alert(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.alert)
			this._logger.log('alert', message, ...args);
	}

	public emergency(message: string, ...args: unknown[]): void {
		if(this._client.options.logging?.enable && this._client.options.logging.emergency)
			this._logger.log('emerg', message, ...args);
	}
}

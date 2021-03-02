import os from 'os';
import zlib from 'fast-zlib';
import ws from 'ws';
import { Constants } from '../utils/constants';
import type { GatewayMessage } from '../utils/types';
import { GatewayEncoding, GatewayOpcodes } from '../utils/types';

import type { Client } from '../client/client';

let erl: { unpack: (arg0: unknown) => string; } | null;

export class WebsocketClient {
	private _ws: ws | undefined;
	private _sequence: number | null;
	private readonly _client: Client;
	private readonly _token: string;
	private readonly _inflateContext: zlib.Inflate;

	public constructor(client: Client, token: string) {
		this._client = client;
		this._token = token;
		this._inflateContext = new zlib.Inflate();
		this._sequence = null;

		if(this._client.options.ws?.gatewayVersion !== Constants.defaults.clientOptions.ws?.gatewayVersion)
			this._client.logger.alert('You changed the default Websocket Gateway Version! Note that changing it can cause' +
				' unwanted side effects! Use with caution.');

		try {
			erl = require('erlpack');
		} catch {
			erl = null;
		}

		if(erl === null && this._client.options.ws?.encoding === GatewayEncoding.Etf) {
			this._client.logger.emergency('You have selected the Gateway Encoding to be of Etf yet you did not install the' +
				' optional dependency "erlpack". This dependency is needed to use the Etf encoding. Please install that' +
				' package and try again. The program will now exit.');

			process.exit(1);
		}
	}

	public connect(): void {
		const websocketConnection = new ws(`${this._client.options.ws?.gatewayUrl}?v=${this._client.options.ws?.gatewayVersion}&encoding=${this._client.options.ws?.encoding}${this._client.options.ws?.compression ? '&compress=zlib-stream' : ''}`);

		websocketConnection.on('open', () => {
			this._ws = websocketConnection;
		});

		websocketConnection.on('close', (code, reason) => {
			console.log(code, reason);
		});

		websocketConnection.on('message', async (msg) => {
			const message = await this._handleMessage<GatewayMessage>(msg);

			// if(message.s) this._sequence = message.s;

			switch(message.op) {
				case GatewayOpcodes.Hello:
					this._sendHeartbeat(message.d.heartbeat_interval);
					this.send<GatewayMessage>({
						op: GatewayOpcodes.Identify,
						d: {
							compress: this._client.options.ws?.compression,
							intents: this._client.options.start?.intents as number,
							large_threshold: this._client.options.start?.large_threshold,
							presence: this._client.options.start?.presence,
							token: this._token,
							// TODO: Change when sharding is implemented
							shard: [0, 1],
							properties: {
								$browser: '@argon-project/library',
								$device: '@argon-project/library',
								$os: os.platform(),
							},
						},
					});
					break;
				case GatewayOpcodes.HeartbeatAck:
					break;
				default:
					// TODO: Send error message after coding in all the available opcodes
					break;
			}
		});
	}

	public send<T>(payload: T): void {
		if(this._ws) {
			let message: string;

			if(this._client.options.ws?.encoding === GatewayEncoding.Etf) {
				// @ts-ignore
				message = erl.pack(payload);
			} else {
				message = JSON.stringify(payload);
			}

			this._ws.send(message);
		} else this._client.logger.warning('The library attempted to send data to the gateway while it has not been' +
			' initialized yet.');
	}

	private async _handleMessage<T>(payload: unknown): Promise<T> {
		let message: T | string;

		if(this._client.options.ws?.compression) {
			message = this._inflateContext.process(payload as Buffer).toString();
		} else message = payload as string;

		if(this._client.options.ws?.encoding === GatewayEncoding.Etf) {
			// @ts-ignore
			message = erl.unpack(message);
		}

		message = JSON.parse(message) as T;

		return message;
	}

	private _sendHeartbeat(time: number): void {
		setInterval(() => this.send<GatewayMessage>({
			op: GatewayOpcodes.Heartbeat,
			d: this._sequence,
		}), time);
	}
}

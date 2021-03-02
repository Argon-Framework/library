import { GatewayEncoding } from './types';

import type { ConstantsType } from './types';

export const Constants: ConstantsType = {
	defaults: {
		clientOptions: {
			logging: {
				enable: true,
				debug: false,
				info: true,
				alert: true,
				critical: true,
				emergency: true,
				error: true,
				notice: true,
				warning: true,
			},
			rest: {
				apiVersion: 8,
				apiUrl: 'https://discord.com/api',
				exitOnError: false,
				restRequestTimeout: 3000,
				maxRetries: 3,
			},
			ws: {
				gatewayUrl: 'wss://gateway.discord.gg/',
				gatewayVersion: 8,
				compression: true,
				encoding: GatewayEncoding.Json,
			},
			start: {
				presence: undefined,
				large_threshold: undefined,
				intents: 0,
			},
		},
	},
};

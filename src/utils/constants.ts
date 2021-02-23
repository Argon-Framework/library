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
		},
	},
};

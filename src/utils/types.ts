import type { Method } from 'axios';

export interface ClientOptions {
	logging?: LoggingOptionsFalse | LoggingOptionsTrue;
	rest?: RestOptions;
}

export interface LoggingOptionsFalse {
	enable: false;
}

export interface LoggingOptionsTrue {
	enable: true;
	debug?: boolean;
	info?: boolean;
	notice?: boolean;
	warning?: boolean;
	error?: boolean;
	critical?: boolean;
	alert?: boolean;
	emergency?: boolean;
}

export interface RestOptions {
	apiUrl?: string;
	apiVersion?: number;
	restRequestTimeout?: number;
	maxRetries?: number;
	exitOnError?: boolean;
}

export interface ConstantsType {
	defaults: ConstantsDefaults;
}

export interface ConstantsDefaults {
	clientOptions: ClientOptions;
}

export interface RequestOptions {
	path: string;
	reason?: string;
	retires?: number;
	requiresAuth?: boolean;
	headers?: Record<string, unknown>;
	data?: Record<string, unknown> | FormData;
	method?: Method;
	files?: File[];
}

export interface GETGateway {
	url: string;
}

export interface GETGatewayBot extends GETGateway {
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
		max_concurrency: number;
	}
}

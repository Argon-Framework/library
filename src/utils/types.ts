import type { Method } from 'axios';

// Interfaces
export interface ClientOptions {
	logging?: LoggingOptionsFalse | LoggingOptionsTrue;
	rest?: RestOptions;
	ws?: WebsocketOptions;
	start?: StartOptions;
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

export interface WebsocketOptions {
	gatewayUrl?: string;
	gatewayVersion?: number;
	compression?: boolean;
	encoding?: GatewayEncoding;
}

export interface RestOptions {
	apiUrl?: string;
	apiVersion?: number;
	restRequestTimeout?: number;
	maxRetries?: number;
	exitOnError?: boolean;
}

// TODO: Add shard options when sharding is implemented
export interface StartOptions {
	intents?: number;
	large_threshold?: number;
	presence?: BotPresenceOptions;
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

export interface BotPresenceOptions {
	since?: number;
	afk?: boolean;
	activities?: BotPresenceActivity[];
	status?: StatusTypes;
}

export interface BotPresenceActivityNoUrl {
	name: string;
	type: ActivityTypes;
}

export interface BotPresenceActivityUrl {
	name: string;
	type: ActivityTypes.Streaming;
	url: string;
}

export interface HeartbeatGateway {
	op: GatewayOpcodes.Heartbeat;
	d: number | null;
}

// Note: Not including guild_subscriptions due to it being deprecated in v8
export interface IdentifyGateway {
	op: GatewayOpcodes.Identify;
	d: {
		token: string;
		intents: number;
		properties: {
			$os: string;
			$browser: string;
			$device: string;
		};
		compress?: boolean;
		large_threshold?: number;
		shard?: [number, number];
		presence?: BotPresenceOptions;
	};
}

export interface HelloGateway {
	op: GatewayOpcodes.Hello;
	d: {
		heartbeat_interval: number;
	};
}

export interface HeartbeatAckGateway {
	op: GatewayOpcodes.HeartbeatAck;
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

// Type Aliases
export type GatewayMessage = HeartbeatGateway | IdentifyGateway | HelloGateway | HeartbeatAckGateway;
export type BotPresenceActivity = BotPresenceActivityNoUrl | BotPresenceActivityUrl

// Enums
export enum GatewayEncoding {
	Json = 'json',
	Etf = 'etf',
}

export enum ActivityTypes {
	Game = 0,
	Streaming = 1,
	Listening = 2,
	Custom = 4,
	Competing = 5,
}

export enum StatusTypes {
	online = 'online',
	dnd = 'dnd',
	idle = 'idle',
	invisible = 'invisible',
	offline = 'offline',
}

export enum GatewayOpcodes {
	Heartbeat = 1,
	Identify = 2,
	Hello = 10,
	HeartbeatAck = 11,
}

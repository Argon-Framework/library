// TODO: Redo this entire class cuz its kinda scuffed (Especially the types)
import axios from 'axios';
import { queue } from 'async';
import { Constants } from '../utils/constants';
import { sleep } from '../utils/sleep';

import type { QueueObject } from 'async';
import type { AxiosPromise } from 'axios';
import type { Client } from '../client/client';
import type { RequestOptions } from '../utils/types';

export class RestClient {
	private readonly _client: Client;
	private readonly _queue: QueueObject<RequestOptions>;

	private readonly _token: string;

	public constructor(client: Client, token: string) {
		this._client = client;
		this._token = token;

		if(this._client.options.rest?.apiVersion !== Constants.defaults.clientOptions.rest?.apiVersion)
			this._client.logger.alert('You changed the default API Version! Note that changing it can cause unwanted' +
				' side effects! Use with caution.');

		this._queue = queue(async (task) => {
			// eslint-disable-next-line no-useless-catch
			try {
				return this._makeRequest(task);
			} catch (e) {
				throw e;
			}
		}, 1);
	}

	public async get<T>(options: RequestOptions): Promise<T> {
		return await this._request<T>({
			path: options.path,
			requiresAuth: options.requiresAuth,
			method: 'GET',
			headers: options.headers,
			reason: options.reason,
			data: options.data,
			files: options.files,
		});
	}

	public async post<T>(options: RequestOptions): Promise<T> {
		return await this._request<T>({
			path: options.path,
			requiresAuth: options.requiresAuth,
			method: 'POST',
			headers: options.headers,
			reason: options.reason,
			data: options.data,
			files: options.files,
		});
	}

	public async patch<T>(options: RequestOptions): Promise<T> {
		return await this._request<T>({
			path: options.path,
			requiresAuth: options.requiresAuth,
			method: 'PATCH',
			headers: options.headers,
			reason: options.reason,
			data: options.data,
			files: options.files,
		});
	}

	public async put<T>(options: RequestOptions): Promise<T> {
		return await this._request<T>({
			path: options.path,
			requiresAuth: options.requiresAuth,
			method: 'PUT',
			headers: options.headers,
			reason: options.reason,
			data: options.data,
			files: options.files,
		});
	}

	public async delete<T>(options: RequestOptions): Promise<T> {
		return await this._request<T>({
			path: options.path,
			requiresAuth: options.requiresAuth,
			method: 'DELETE',
			headers: options.headers,
			reason: options.reason,
			data: options.data,
			files: options.files,
		});
	}

	private async _request<T>(options: RequestOptions): Promise<T> {
		if(!options.headers) options.headers = {};
		if(options.requiresAuth) options.headers['Authorization'] = `Bot ${this._token}`;
		if (options.reason) options.headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);

		if (options.files && options.files.length) {
			const formData = new FormData();
			for (const file of options.files) formData.append(file.name, file, file.name);
			if (typeof options.data !== 'undefined') formData.append('payload_json', JSON.stringify(options.data));
			options.data = formData;
		}

		if(!options.retires) options.retires = 0;

		let res: any;

		try {
			res = await this._queue.pushAsync(options);
		} catch (e) {
			res = e.response;
		}

		// @ts-ignore
		if(res.message && res.message === 'Cancel') {
			if(options.retires >= this._client.options.rest?.maxRetries!) {
				this._client.logger.error(`Request timed out for "(${options.method.toUpperCase()}) ${options.path}" however the max retries has reached. Aborting request...`);
				if(this._client.options.rest?.exitOnError) return process.exit(1);
				else throw new Error(`Max Retires reached for request "(${options.method.toUpperCase()}) ${options.path}"`);
			}

			this._client.logger.warning(`Request timed out for "(${options.method.toUpperCase()}) ${options.path}"... Retrying request (${options.retires + 1})`);

			options.retires++;

			return await this._request(options);
		}
		const retryAfter = res.headers['x-ratelimit-reset-after'];

		if (res.headers['x-ratelimit-global']) {
			this._client.logger.critical(`Global Ratelimit hit for "(${options.method.toUpperCase()}) ${options.path}"! Retrying request in ${res.headers['x-ratelimit-global']} seconds`);
			await sleep(res.headers['x-ratelimit-global'] * 1000);
		}

		if (res.status >= 400 && res.status < 500) {
			if (res.status === 429) {
				this._client.logger.warning(`Ratelimit hit for "(${options.method.toUpperCase()}) ${options.path}"... Retrying request in ${retryAfter} seconds`);
				await sleep(retryAfter * 1000);
				return await this._request(options);
			}

			// TODO: Handle other status codes
		}

		if (res.status >= 500 && res.status < 600) {
			if(options.retires >= this._client.options.rest?.maxRetries!) {
				this._client.logger.error(`A server-side error has occurred for request "(${options.method.toUpperCase()}) ${options.path}" however the max retries has reached. Aborting request...`);
				if(this._client.options.rest?.exitOnError) return process.exit(1);
				else throw new Error(`Max Retires reached for request "(${options.method.toUpperCase()}) ${options.path}"`);
			}

			this._client.logger.warning(`A server-side error has occurred for request "(${options.method.toUpperCase()}) ${options.path}"... Retrying request (${options.retires + 1})`);

			options.retires++;

			return await this._request(options);
		}

		return res.data;
	}

	private async _makeRequest(options: RequestOptions): Promise<AxiosPromise<any>> {
		const cancelToken = axios.CancelToken;
		const source = cancelToken.source();
		const timeout = setTimeout(() => source.cancel(), this._client.options.rest?.restRequestTimeout);

		// eslint-disable-next-line no-useless-catch
		try {
			return axios({
				method: options.method,
				baseURL: `${this._client.options.rest?.apiUrl}/v${this._client.options.rest?.apiVersion}`,
				url: options.path,
				headers: options.headers,
				data: options.data ?? null,
				cancelToken: source.token,
			}).finally(() => clearTimeout(timeout));
		} catch (e) {
			throw e;
		}
	}
}

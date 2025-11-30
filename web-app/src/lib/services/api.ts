import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { authStore } from '$stores/auth';
import { get } from 'svelte/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: API_BASE_URL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// Request interceptor - add JWT token
		this.client.interceptors.request.use(
			(config) => {
				const auth = get(authStore);
				if (auth.token) {
					config.headers.Authorization = `Bearer ${auth.token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor - handle errors
		this.client.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				if (error.response?.status === 401) {
					// Unauthorized - clear auth
					authStore.clearAuth();
					if (typeof window !== 'undefined') {
						window.location.href = '/auth/login';
					}
				}
				return Promise.reject(error);
			}
		);
	}

	async get<T>(url: string, params?: any): Promise<T> {
		const response = await this.client.get<T>(url, { params });
		return response.data;
	}

	async post<T>(url: string, data?: any): Promise<T> {
		const response = await this.client.post<T>(url, data);
		return response.data;
	}

	async put<T>(url: string, data?: any): Promise<T> {
		const response = await this.client.put<T>(url, data);
		return response.data;
	}

	async delete<T>(url: string): Promise<T> {
		const response = await this.client.delete<T>(url);
		return response.data;
	}
}

export const api = new ApiClient();

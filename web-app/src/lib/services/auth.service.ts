import { api } from './api';
import { authStore } from '$stores/auth';
import type { AuthResponse, User, ApiResponse } from '$types';

export const authService = {
	async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
		const response = await api.post<AuthResponse>('/api/users/register', {
			email,
			password,
			firstName,
			lastName
		});

		if (response.success && response.data) {
			authStore.setAuth(response.data.user, response.data.token);
		}
	},

	async login(email: string, password: string): Promise<void> {
		const response = await api.post<AuthResponse>('/api/users/login', {
			email,
			password
		});

		if (response.success && response.data) {
			authStore.setAuth(response.data.user, response.data.token);
		}
	},

	async getProfile(): Promise<User> {
		const response = await api.get<ApiResponse<{ user: User }>>('/api/users/profile');
		
		if (response.success && response.data) {
			return response.data.user;
		}
		
		throw new Error('Failed to get profile');
	},

	async updateProfile(data: Partial<User>): Promise<User> {
		const response = await api.put<ApiResponse<{ user: User }>>('/api/users/profile', data);
		
		if (response.success && response.data) {
			return response.data.user;
		}
		
		throw new Error('Failed to update profile');
	},

	logout(): void {
		authStore.clearAuth();
	}
};

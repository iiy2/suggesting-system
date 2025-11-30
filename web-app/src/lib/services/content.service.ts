import { api } from './api';
import type { Content, ContentListResponse, ContentQueryParams, ApiResponse } from '$types';

export const contentService = {
	async getAll(params?: ContentQueryParams): Promise<ContentListResponse> {
		return await api.get<ContentListResponse>('/api/content', params);
	},

	async getById(id: string): Promise<Content> {
		const response = await api.get<ApiResponse<{ content: Content }>>(`/api/content/${id}`);
		
		if (response.success && response.data) {
			return response.data.content;
		}
		
		throw new Error('Content not found');
	},

	async create(data: Partial<Content>): Promise<Content> {
		const response = await api.post<ApiResponse<{ content: Content }>>('/api/content', data);
		
		if (response.success && response.data) {
			return response.data.content;
		}
		
		throw new Error('Failed to create content');
	},

	async update(id: string, data: Partial<Content>): Promise<Content> {
		const response = await api.put<ApiResponse<{ content: Content }>>(`/api/content/${id}`, data);
		
		if (response.success && response.data) {
			return response.data.content;
		}
		
		throw new Error('Failed to update content');
	},

	async delete(id: string): Promise<void> {
		await api.delete(`/api/content/${id}`);
	}
};

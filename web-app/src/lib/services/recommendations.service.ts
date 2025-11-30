import { api } from './api';
import type { RecommendationResponse, UserInteraction, ApiResponse } from '$types';

export const recommendationsService = {
	async getPersonalized(): Promise<RecommendationResponse> {
		return await api.get<RecommendationResponse>('/api/recommendations');
	},

	async getSimilar(contentId: string): Promise<RecommendationResponse> {
		return await api.get<RecommendationResponse>(`/api/recommendations/similar/${contentId}`);
	},

	async recordInteraction(interaction: UserInteraction): Promise<void> {
		await api.post<ApiResponse>('/api/recommendations/interactions', interaction);
	}
};

// User types
export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	createdAt: string;
}

export interface AuthResponse {
	success: boolean;
	message?: string;
	data?: {
		user: User;
		token: string;
	};
}

// Content types
export type ContentType = 'course' | 'article' | 'video' | 'news';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Content {
	id: string;
	title: string;
	description?: string;
	contentType: ContentType;
	category?: string;
	tags: string[];
	authorId?: string;
	difficultyLevel?: DifficultyLevel;
	durationMinutes?: number;
	language: string;
	isPublished: boolean;
	publishedAt?: string;
	viewCount: number;
	rating: number;
	createdAt: string;
	updatedAt: string;
}

export interface ContentQueryParams {
	page?: number;
	limit?: number;
	contentType?: ContentType;
	category?: string;
	difficulty?: DifficultyLevel;
	language?: string;
	isPublished?: boolean;
	search?: string;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ContentListResponse {
	success: boolean;
	data?: {
		content: Content[];
	};
	pagination?: Pagination;
}

// Recommendation types
export interface Recommendation {
	contentId: string;
	score: number;
	reason: string; // 'collaborative', 'content_based', 'hybrid', 'popular'
	content?: Content;
}

export interface RecommendationResponse {
	success: boolean;
	recommendations?: Recommendation[];
	count?: number;
}

// Interaction types
export type InteractionAction = 'view' | 'like' | 'bookmark' | 'complete';

export interface UserInteraction {
	userId: string;
	contentId: string;
	action: InteractionAction;
	rating?: number;
	duration?: number;
}

// API Response
export interface ApiResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	errors?: Array<{
		field: string;
		message: string;
	}>;
}

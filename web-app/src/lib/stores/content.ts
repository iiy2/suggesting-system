import { writable } from 'svelte/store';
import type { Content, ContentQueryParams, Pagination } from '$types';

interface ContentState {
	items: Content[];
	filters: ContentQueryParams;
	pagination: Pagination | null;
	loading: boolean;
	error: string | null;
}

function createContentStore() {
	const { subscribe, set, update } = writable<ContentState>({
		items: [],
		filters: {
			page: 1,
			limit: 20
		},
		pagination: null,
		loading: false,
		error: null
	});

	return {
		subscribe,
		setContent: (items: Content[], pagination: Pagination) => {
			update(state => ({
				...state,
				items,
				pagination,
				loading: false,
				error: null
			}));
		},
		setFilters: (filters: ContentQueryParams) => {
			update(state => ({
				...state,
				filters: { ...state.filters, ...filters, page: 1 }
			}));
		},
		setPage: (page: number) => {
			update(state => ({
				...state,
				filters: { ...state.filters, page }
			}));
		},
		setLoading: (loading: boolean) => {
			update(state => ({ ...state, loading }));
		},
		setError: (error: string) => {
			update(state => ({ ...state, error, loading: false }));
		},
		clearError: () => {
			update(state => ({ ...state, error: null }));
		},
		reset: () => {
			set({
				items: [],
				filters: { page: 1, limit: 20 },
				pagination: null,
				loading: false,
				error: null
			});
		}
	};
}

export const contentStore = createContentStore();

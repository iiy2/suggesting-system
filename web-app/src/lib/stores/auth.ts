import { writable } from 'svelte/store';
import type { User } from '$types';

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
		loading: true
	});

	return {
		subscribe,
		setAuth: (user: User, token: string) => {
			update(state => ({
				...state,
				user,
				token,
				isAuthenticated: true,
				loading: false
			}));
			// Store token in localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('token', token);
			}
		},
		clearAuth: () => {
			set({
				user: null,
				token: null,
				isAuthenticated: false,
				loading: false
			});
			// Remove token from localStorage
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token');
			}
		},
		setLoading: (loading: boolean) => {
			update(state => ({ ...state, loading }));
		},
		// Initialize from localStorage
		init: () => {
			if (typeof window !== 'undefined') {
				const token = localStorage.getItem('token');
				if (token) {
					update(state => ({ ...state, token, loading: false }));
				} else {
					update(state => ({ ...state, loading: false }));
				}
			}
		}
	};
}

export const authStore = createAuthStore();

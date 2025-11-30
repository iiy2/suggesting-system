<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$stores/auth';
	import { authService } from '$services/auth.service';
	import { goto } from '$app/navigation';
	import { AppBar } from '@skeletonlabs/skeleton';

	function handleLogout() {
		authService.logout();
		goto('/');
	}
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<a href="/" class="text-xl font-bold">
			🎓 Рекомендаційна Система
		</a>
	</svelte:fragment>

	<svelte:fragment slot="trail">
		<nav class="flex gap-4 items-center">
			<a 
				href="/content" 
				class="btn btn-sm variant-ghost-surface"
				class:variant-filled-primary={$page.url.pathname.startsWith('/content')}
			>
				Контент
			</a>

			{#if $authStore.isAuthenticated}
				<a 
					href="/recommendations" 
					class="btn btn-sm variant-ghost-surface"
					class:variant-filled-primary={$page.url.pathname === '/recommendations'}
				>
					Рекомендації
				</a>

				<a 
					href="/dashboard" 
					class="btn btn-sm variant-ghost-surface"
					class:variant-filled-primary={$page.url.pathname === '/dashboard'}
				>
					Dashboard
				</a>

				{#if $authStore.user?.role === 'admin' || $authStore.user?.role === 'moderator'}
					<a 
						href="/admin" 
						class="btn btn-sm variant-ghost-surface"
						class:variant-filled-primary={$page.url.pathname === '/admin'}
					>
						Адмін
					</a>
				{/if}

				<div class="flex items-center gap-2">
					<span class="text-sm">
						{$authStore.user?.firstName} {$authStore.user?.lastName}
					</span>
					<button 
						on:click={handleLogout}
						class="btn btn-sm variant-filled-error"
					>
						Вийти
					</button>
				</div>
			{:else}
				<a href="/auth/login" class="btn btn-sm variant-ghost-surface">
					Увійти
				</a>
				<a href="/auth/register" class="btn btn-sm variant-filled-primary">
					Реєстрація
				</a>
			{/if}
		</nav>
	</svelte:fragment>
</AppBar>

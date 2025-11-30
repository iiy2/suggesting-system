<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$stores/auth';
	import { recommendationsService } from '$services/recommendations.service';
	import type { Recommendation } from '$types';
	import RecommendationCard from '$components/RecommendationCard.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let recommendations: Recommendation[] = [];
	let loading = true;
	let filter: 'all' | 'collaborative' | 'content_based' | 'hybrid' | 'popular' = 'all';

	const filterLabels: Record<string, string> = {
		all: 'Всі рекомендації',
		collaborative: 'На основі схожих користувачів',
		content_based: 'На основі схожого контенту',
		hybrid: 'Гібридні',
		popular: 'Популярне'
	};

	onMount(async () => {
		if (!$authStore.isAuthenticated) {
			toastStore.trigger({
				message: 'Будь ласка, увійдіть для перегляду рекомендацій',
				background: 'variant-filled-warning'
			});
			return;
		}

		await loadRecommendations();
	});

	async function loadRecommendations() {
		loading = true;
		try {
			const response = await recommendationsService.getPersonalized();

			if (response.success && response.data) {
				recommendations = response.data;
			}
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка завантаження рекомендацій',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	$: filteredRecommendations = filter === 'all'
		? recommendations
		: recommendations.filter(r => r.reason === filter);

	$: groupedRecommendations = recommendations.reduce((acc, rec) => {
		if (!acc[rec.reason]) {
			acc[rec.reason] = [];
		}
		acc[rec.reason].push(rec);
		return acc;
	}, {} as Record<string, Recommendation[]>);
</script>

<svelte:head>
	<title>Рекомендації - Рекомендаційна Система</title>
</svelte:head>

<div class="container mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="h1">✨ Персональні Рекомендації</h1>
			<p class="opacity-70 mt-2">Контент, підібраний спеціально для вас</p>
		</div>

		<button
			class="btn variant-filled-secondary"
			on:click={loadRecommendations}
			disabled={loading}
		>
			🔄 Оновити
		</button>
	</div>

	{#if !$authStore.isAuthenticated}
		<div class="card p-10 text-center space-y-4">
			<p class="text-xl">Увійдіть, щоб побачити персональні рекомендації</p>
			<a href="/auth/login" class="btn variant-filled-primary">
				Увійти
			</a>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center p-10">
			<div class="animate-pulse text-lg">Завантаження рекомендацій...</div>
		</div>
	{:else if recommendations.length === 0}
		<div class="card p-10 text-center space-y-4">
			<p class="text-xl opacity-70">Поки що немає рекомендацій</p>
			<p class="text-sm opacity-50">
				Почніть взаємодіяти з контентом, щоб отримати персоналізовані рекомендації
			</p>
			<a href="/content" class="btn variant-filled-primary">
				Переглянути весь контент
			</a>
		</div>
	{:else}
		<!-- Filter tabs -->
		<div class="card p-2">
			<div class="flex flex-wrap gap-2">
				{#each Object.entries(filterLabels) as [key, label]}
					<button
						class="btn btn-sm {filter === key ? 'variant-filled-primary' : 'variant-ghost-surface'}"
						on:click={() => filter = key}
					>
						{label}
						{#if key === 'all'}
							({recommendations.length})
						{:else}
							({groupedRecommendations[key]?.length || 0})
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Recommendations grid -->
		{#if filteredRecommendations.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredRecommendations as recommendation (recommendation.contentId)}
					<RecommendationCard {recommendation} />
				{/each}
			</div>
		{:else}
			<div class="card p-6 text-center">
				<p class="opacity-70">Немає рекомендацій цього типу</p>
			</div>
		{/if}

		<!-- Stats -->
		<div class="card p-6">
			<h3 class="h3 mb-4">Статистика рекомендацій</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="text-center">
					<div class="text-3xl font-bold text-primary-500">{recommendations.length}</div>
					<div class="text-sm opacity-70">Всього</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-secondary-500">
						{groupedRecommendations.collaborative?.length || 0}
					</div>
					<div class="text-sm opacity-70">Collaborative</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-tertiary-500">
						{groupedRecommendations.content_based?.length || 0}
					</div>
					<div class="text-sm opacity-70">Content-Based</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-warning-500">
						{groupedRecommendations.popular?.length || 0}
					</div>
					<div class="text-sm opacity-70">Popular</div>
				</div>
			</div>
		</div>

		<!-- Info -->
		<div class="card variant-ghost-surface p-4">
			<h4 class="h4 mb-2">ℹ️ Як працюють рекомендації?</h4>
			<ul class="list-disc list-inside space-y-1 text-sm opacity-80">
				<li><strong>Collaborative:</strong> На основі вподобань схожих користувачів</li>
				<li><strong>Content-Based:</strong> На основі контенту, який ви вже переглядали</li>
				<li><strong>Hybrid:</strong> Комбінація обох підходів для кращої точності</li>
				<li><strong>Popular:</strong> Популярний контент серед усіх користувачів</li>
			</ul>
		</div>
	{/if}
</div>

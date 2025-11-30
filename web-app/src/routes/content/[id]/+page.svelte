<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth';
	import { contentService } from '$services/content.service';
	import { recommendationsService } from '$services/recommendations.service';
	import type { Content, Recommendation, UserInteraction } from '$types';
	import RatingStars from '$components/RatingStars.svelte';
	import RecommendationCard from '$components/RecommendationCard.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let content: Content | null = null;
	let similarContent: Recommendation[] = [];
	let loading = true;
	let similarLoading = false;
	let userRating: number = 0;

	const typeEmojis: Record<string, string> = {
		course: '📚',
		article: '📝',
		video: '🎥',
		news: '📰'
	};

	const difficultyLabels: Record<string, string> = {
		beginner: 'Початковий',
		intermediate: 'Середній',
		advanced: 'Просунутий'
	};

	onMount(async () => {
		const contentId = $page.params.id;
		await loadContent(contentId);
		await loadSimilarContent(contentId);

		// Record view interaction
		if ($authStore.isAuthenticated) {
			await recordInteraction('view');
		}
	});

	async function loadContent(id: string) {
		loading = true;
		try {
			const response = await contentService.getById(id);
			if (response.success && response.data) {
				content = response.data;
			}
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка завантаження контенту',
				background: 'variant-filled-error'
			});
			goto('/content');
		} finally {
			loading = false;
		}
	}

	async function loadSimilarContent(id: string) {
		if (!$authStore.isAuthenticated) return;

		similarLoading = true;
		try {
			const response = await recommendationsService.getSimilar(id);
			if (response.success && response.data) {
				similarContent = response.data.slice(0, 3); // Top 3 similar items
			}
		} catch (error) {
			console.error('Failed to load similar content:', error);
		} finally {
			similarLoading = false;
		}
	}

	async function recordInteraction(type: UserInteraction['interactionType'], rating?: number) {
		if (!$authStore.isAuthenticated || !content) return;

		try {
			await recommendationsService.recordInteraction({
				contentId: content.id,
				interactionType: type,
				rating: rating,
				timestamp: new Date().toISOString()
			});
		} catch (error) {
			console.error('Failed to record interaction:', error);
		}
	}

	async function handleRate(rating: number) {
		userRating = rating;
		await recordInteraction('rating', rating);

		toastStore.trigger({
			message: `Ви поставили оцінку ${rating} зірок!`,
			background: 'variant-filled-success'
		});

		// Reload content to get updated rating
		if (content) {
			await loadContent(content.id);
		}
	}

	async function handleComplete() {
		await recordInteraction('completion');

		toastStore.trigger({
			message: 'Контент позначено як завершений!',
			background: 'variant-filled-success'
		});
	}
</script>

<svelte:head>
	<title>{content?.title || 'Завантаження...'} - Рекомендаційна Система</title>
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center p-10">
		<div class="animate-pulse text-lg">Завантаження...</div>
	</div>
{:else if content}
	<div class="container mx-auto space-y-6">
		<!-- Breadcrumbs -->
		<div class="breadcrumb">
			<a href="/" class="anchor">Головна</a>
			<span>/</span>
			<a href="/content" class="anchor">Контент</a>
			<span>/</span>
			<span class="opacity-70">{content.title}</span>
		</div>

		<!-- Main content -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Content details -->
			<div class="lg:col-span-2 space-y-4">
				<div class="card p-6 space-y-4">
					<!-- Header -->
					<div class="flex items-start justify-between gap-4">
						<div class="flex items-center gap-3">
							<span class="text-5xl">{typeEmojis[content.contentType] || '📄'}</span>
							<div>
								<h1 class="h1">{content.title}</h1>
								{#if content.author}
									<p class="text-sm opacity-70">Автор: {content.author}</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Meta info -->
					<div class="flex flex-wrap gap-4 items-center text-sm">
						{#if content.difficultyLevel}
							<span class="chip variant-filled">
								Рівень: {difficultyLabels[content.difficultyLevel]}
							</span>
						{/if}
						{#if content.language}
							<span class="chip variant-soft">
								Мова: {content.language.toUpperCase()}
							</span>
						{/if}
						{#if content.durationMinutes}
							<span class="chip variant-soft">
								⏱️ {content.durationMinutes} хв
							</span>
						{/if}
						<span class="chip variant-soft">
							👁️ {content.viewCount} переглядів
						</span>
					</div>

					<!-- Rating -->
					<div class="card variant-glass p-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm opacity-70 mb-1">Середня оцінка</p>
								<RatingStars rating={content.rating} size="lg" />
							</div>
							{#if $authStore.isAuthenticated}
								<div>
									<p class="text-sm opacity-70 mb-1">Ваша оцінка</p>
									<RatingStars
										rating={userRating}
										size="lg"
										interactive={true}
										onRate={handleRate}
									/>
								</div>
							{/if}
						</div>
					</div>

					<!-- Description -->
					{#if content.description}
						<div>
							<h3 class="h3 mb-2">Опис</h3>
							<p class="opacity-80">{content.description}</p>
						</div>
					{/if}

					<!-- Tags -->
					{#if content.tags.length > 0}
						<div>
							<h3 class="h3 mb-2">Теги</h3>
							<div class="flex flex-wrap gap-2">
								{#each content.tags as tag}
									<span class="chip variant-soft">{tag}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- URL -->
					{#if content.url}
						<div class="flex gap-2">
							<a
								href={content.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn variant-filled-primary flex-grow"
								on:click={() => recordInteraction('click')}
							>
								Перейти до контенту →
							</a>

							{#if $authStore.isAuthenticated}
								<button
									class="btn variant-filled-success"
									on:click={handleComplete}
								>
									✓ Завершено
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="space-y-4">
				<!-- Metadata card -->
				<div class="card p-4 space-y-3">
					<h3 class="h3">Деталі</h3>

					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="opacity-70">Тип:</span>
							<span class="font-bold">{content.contentType}</span>
						</div>

						{#if content.publishedAt}
							<div class="flex justify-between">
								<span class="opacity-70">Опубліковано:</span>
								<span>{new Date(content.publishedAt).toLocaleDateString('uk-UA')}</span>
							</div>
						{/if}

						{#if content.updatedAt}
							<div class="flex justify-between">
								<span class="opacity-70">Оновлено:</span>
								<span>{new Date(content.updatedAt).toLocaleDateString('uk-UA')}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Similar content -->
				{#if $authStore.isAuthenticated}
					<div class="card p-4 space-y-3">
						<h3 class="h3">Схожий контент</h3>

						{#if similarLoading}
							<div class="animate-pulse text-sm opacity-70">Завантаження...</div>
						{:else if similarContent.length > 0}
							<div class="space-y-2">
								{#each similarContent as recommendation}
									<RecommendationCard {recommendation} />
								{/each}
							</div>
						{:else}
							<p class="text-sm opacity-70">Схожий контент не знайдено</p>
						{/if}
					</div>
				{/if}
			</aside>
		</div>
	</div>
{:else}
	<div class="card p-10 text-center">
		<p class="text-xl opacity-70">Контент не знайдено</p>
		<a href="/content" class="btn variant-filled-primary mt-4">
			← Назад до контенту
		</a>
	</div>
{/if}

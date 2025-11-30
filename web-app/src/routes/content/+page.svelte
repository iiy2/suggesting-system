<script lang="ts">
	import { onMount } from 'svelte';
	import { contentStore } from '$stores/content';
	import { contentService } from '$services/content.service';
	import ContentCard from '$components/ContentCard.svelte';
	import FilterPanel from '$components/FilterPanel.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let loading = false;

	onMount(async () => {
		await loadContent();
	});

	async function loadContent() {
		loading = true;
		try {
			const filters = $contentStore.filters;
			const response = await contentService.getAll(filters);

			if (response.success && response.data) {
				contentStore.setContent(response.data, response.pagination);
			}
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка завантаження контенту',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	// Subscribe to filter changes
	$: if ($contentStore.filters) {
		loadContent();
	}

	function handlePageChange(page: number) {
		contentStore.setPage(page);
	}
</script>

<svelte:head>
	<title>Контент - Рекомендаційна Система</title>
</svelte:head>

<div class="container mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="h1">📚 Весь Контент</h1>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Filters sidebar -->
		<aside class="lg:col-span-1">
			<FilterPanel />
		</aside>

		<!-- Content grid -->
		<main class="lg:col-span-3 space-y-6">
			{#if loading}
				<div class="flex items-center justify-center p-10">
					<div class="animate-pulse text-lg">Завантаження...</div>
				</div>
			{:else if $contentStore.items.length === 0}
				<div class="card p-10 text-center">
					<p class="text-xl opacity-70">Контент не знайдено</p>
					<p class="text-sm opacity-50 mt-2">Спробуйте змінити фільтри</p>
				</div>
			{:else}
				<!-- Content grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each $contentStore.items as content (content.id)}
						<ContentCard {content} />
					{/each}
				</div>

				<!-- Pagination -->
				{#if $contentStore.pagination}
					<div class="card p-4">
						<div class="flex items-center justify-between">
							<div class="text-sm opacity-70">
								Показано {($contentStore.pagination.page - 1) * $contentStore.pagination.limit + 1}
								-
								{Math.min($contentStore.pagination.page * $contentStore.pagination.limit, $contentStore.pagination.total)}
								з {$contentStore.pagination.total}
							</div>

							<div class="flex gap-2">
								<button
									class="btn btn-sm variant-filled-surface"
									disabled={!$contentStore.pagination.hasPrevPage}
									on:click={() => handlePageChange($contentStore.pagination!.page - 1)}
								>
									← Попередня
								</button>

								<div class="flex items-center gap-1">
									<span class="text-sm opacity-70">
										Сторінка {$contentStore.pagination.page} з {$contentStore.pagination.totalPages}
									</span>
								</div>

								<button
									class="btn btn-sm variant-filled-surface"
									disabled={!$contentStore.pagination.hasNextPage}
									on:click={() => handlePageChange($contentStore.pagination!.page + 1)}
								>
									Наступна →
								</button>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</main>
	</div>
</div>

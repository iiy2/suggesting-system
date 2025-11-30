<script lang="ts">
	import type { Recommendation } from '$types';

	export let recommendation: Recommendation;

	const reasonColors: Record<string, string> = {
		collaborative: 'variant-filled-primary',
		content_based: 'variant-filled-secondary',
		hybrid: 'variant-filled-tertiary',
		popular: 'variant-filled-warning'
	};

	const reasonLabels: Record<string, string> = {
		collaborative: 'Схожі користувачі',
		content_based: 'Схожий контент',
		hybrid: 'Гібридний',
		popular: 'Популярне'
	};
</script>

{#if recommendation.content}
	<div class="card p-4 space-y-3">
		<div class="flex items-start justify-between gap-2">
			<h3 class="h4 font-bold flex-grow">
				<a href="/content/{recommendation.contentId}" class="anchor">
					{recommendation.content.title}
				</a>
			</h3>
			<span class="badge {reasonColors[recommendation.reason]}">
				{reasonLabels[recommendation.reason]}
			</span>
		</div>

		{#if recommendation.content.description}
			<p class="text-sm opacity-80 line-clamp-2">
				{recommendation.content.description}
			</p>
		{/if}

		<div class="flex items-center justify-between">
			<div class="flex flex-wrap gap-1">
				{#each recommendation.content.tags.slice(0, 3) as tag}
					<span class="chip variant-soft text-xs">{tag}</span>
				{/each}
			</div>

			<div class="flex items-center gap-2">
				<div class="text-sm">
					<span class="font-bold">Score:</span>
					<span>{recommendation.score.toFixed(2)}</span>
				</div>
			</div>
		</div>

		<a 
			href="/content/{recommendation.contentId}" 
			class="btn variant-filled-primary w-full"
		>
			Переглянути
		</a>
	</div>
{/if}

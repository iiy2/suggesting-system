<script lang="ts">
	import type { Content } from '$types';

	export let content: Content;

	const typeEmojis: Record<string, string> = {
		course: '📚',
		article: '📝',
		video: '🎥',
		news: '📰'
	};

	const difficultyColors: Record<string, string> = {
		beginner: 'variant-filled-success',
		intermediate: 'variant-filled-warning',
		advanced: 'variant-filled-error'
	};
</script>

<a href="/content/{content.id}" class="card card-hover p-4 space-y-2 h-full flex flex-col">
	<div class="flex items-start justify-between">
		<span class="text-3xl">{typeEmojis[content.contentType] || '📄'}</span>
		{#if content.difficultyLevel}
			<span class="badge {difficultyColors[content.difficultyLevel]}">
				{content.difficultyLevel}
			</span>
		{/if}
	</div>

	<h3 class="h4 font-bold line-clamp-2">{content.title}</h3>

	{#if content.description}
		<p class="text-sm opacity-80 line-clamp-3 flex-grow">
			{content.description}
		</p>
	{/if}

	<div class="flex flex-wrap gap-1">
		{#each content.tags.slice(0, 3) as tag}
			<span class="chip variant-soft-surface text-xs">{tag}</span>
		{/each}
	</div>

	<div class="flex items-center justify-between text-xs opacity-70 pt-2 border-t border-surface-500">
		<div class="flex items-center gap-3">
			<span>⭐ {content.rating.toFixed(1)}</span>
			<span>👁️ {content.viewCount}</span>
			{#if content.durationMinutes}
				<span>⏱️ {content.durationMinutes} хв</span>
			{/if}
		</div>
	</div>
</a>

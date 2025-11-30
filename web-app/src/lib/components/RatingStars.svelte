<script lang="ts">
	export let rating: number = 0;
	export let maxRating: number = 5;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let interactive: boolean = false;
	export let onRate: ((rating: number) => void) | null = null;

	const sizeClasses = {
		sm: 'text-sm',
		md: 'text-xl',
		lg: 'text-3xl'
	};

	function handleClick(star: number) {
		if (interactive && onRate) {
			onRate(star);
		}
	}
</script>

<div class="flex items-center gap-1 {sizeClasses[size]}">
	{#each Array(maxRating) as _, i}
		<button
			type="button"
			class:cursor-pointer={interactive}
			class:cursor-default={!interactive}
			on:click={() => handleClick(i + 1)}
			disabled={!interactive}
		>
			{#if i < Math.floor(rating)}
				<span class="text-warning-500">★</span>
			{:else if i < rating}
				<span class="text-warning-500">⯨</span>
			{:else}
				<span class="opacity-30">★</span>
			{/if}
		</button>
	{/each}
	{#if rating > 0}
		<span class="text-sm ml-1 opacity-70">
			{rating.toFixed(1)}
		</span>
	{/if}
</div>

<script lang="ts">
	import { authStore } from '$stores/auth';
</script>

<svelte:head>
	<title>Рекомендаційна Система</title>
</svelte:head>

<div class="space-y-10">
	<!-- Hero Section -->
	<section class="text-center space-y-4 py-10">
		<h1 class="h1">
			🎓 Система Рекомендацій для e-Learning
		</h1>
		<p class="text-xl">
			Персоналізовані рекомендації контенту на основі ваших інтересів та поведінки
		</p>

		<div class="flex gap-4 justify-center pt-4">
			{#if !$authStore.isAuthenticated}
				<a href="/auth/register" class="btn variant-filled-primary btn-lg">
					Почати зараз
				</a>
				<a href="/content" class="btn variant-ghost-surface btn-lg">
					Переглянути контент
				</a>
			{:else}
				<a href="/recommendations" class="btn variant-filled-primary btn-lg">
					Мої рекомендації
				</a>
				<a href="/content" class="btn variant-ghost-surface btn-lg">
					Весь контент
				</a>
			{/if}
		</div>
	</section>

	<!-- Features -->
	<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="card p-6 space-y-2">
			<div class="text-4xl">🤖</div>
			<h3 class="h3">Collaborative Filtering</h3>
			<p>Рекомендації на основі схожих користувачів</p>
		</div>

		<div class="card p-6 space-y-2">
			<div class="text-4xl">🎯</div>
			<h3 class="h3">Content-Based</h3>
			<p>Контент схожий на той, що вам подобається</p>
		</div>

		<div class="card p-6 space-y-2">
			<div class="text-4xl">⚡</div>
			<h3 class="h3">Hybrid Approach</h3>
			<p>Комбінація алгоритмів для найкращих результатів</p>
		</div>
	</section>

	<!-- Content Types -->
	<section class="space-y-4">
		<h2 class="h2 text-center">Типи контенту</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<a href="/content?contentType=course" class="card card-hover p-6 text-center space-y-2">
				<div class="text-3xl">📚</div>
				<div class="font-bold">Курси</div>
			</a>
			<a href="/content?contentType=article" class="card card-hover p-6 text-center space-y-2">
				<div class="text-3xl">📝</div>
				<div class="font-bold">Статті</div>
			</a>
			<a href="/content?contentType=video" class="card card-hover p-6 text-center space-y-2">
				<div class="text-3xl">🎥</div>
				<div class="font-bold">Відео</div>
			</a>
			<a href="/content?contentType=news" class="card card-hover p-6 text-center space-y-2">
				<div class="text-3xl">📰</div>
				<div class="font-bold">Новини</div>
			</a>
		</div>
	</section>
</div>

<script lang="ts">
	import { contentStore } from '$stores/content';
	import type { ContentType, DifficultyLevel } from '$types';

	let searchTerm = '';
	let selectedType: ContentType | '' = '';
	let selectedDifficulty: DifficultyLevel | '' = '';
	let selectedLanguage = '';

	function applyFilters() {
		contentStore.setFilters({
			search: searchTerm || undefined,
			contentType: selectedType || undefined,
			difficulty: selectedDifficulty || undefined,
			language: selectedLanguage || undefined
		});
	}

	function resetFilters() {
		searchTerm = '';
		selectedType = '';
		selectedDifficulty = '';
		selectedLanguage = '';
		contentStore.setFilters({ page: 1, limit: 20 });
	}
</script>

<div class="card p-4 space-y-4">
	<h3 class="h3">Фільтри</h3>

	<label class="label">
		<span>Пошук</span>
		<input 
			type="text" 
			class="input" 
			placeholder="Назва або опис..."
			bind:value={searchTerm}
			on:input={applyFilters}
		/>
	</label>

	<label class="label">
		<span>Тип контенту</span>
		<select class="select" bind:value={selectedType} on:change={applyFilters}>
			<option value="">Всі типи</option>
			<option value="course">Курси</option>
			<option value="article">Статті</option>
			<option value="video">Відео</option>
			<option value="news">Новини</option>
		</select>
	</label>

	<label class="label">
		<span>Складність</span>
		<select class="select" bind:value={selectedDifficulty} on:change={applyFilters}>
			<option value="">Всі рівні</option>
			<option value="beginner">Початковий</option>
			<option value="intermediate">Середній</option>
			<option value="advanced">Просунутий</option>
		</select>
	</label>

	<label class="label">
		<span>Мова</span>
		<select class="select" bind:value={selectedLanguage} on:change={applyFilters}>
			<option value="">Всі мови</option>
			<option value="uk">Українська</option>
			<option value="en">English</option>
		</select>
	</label>

	<button 
		on:click={resetFilters}
		class="btn variant-ghost-surface w-full"
	>
		Скинути фільтри
	</button>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$stores/auth';
	import { contentService } from '$services/content.service';
	import { goto } from '$app/navigation';
	import type { Content, ContentType, DifficultyLevel } from '$types';
	import { toastStore, modalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';

	let contents: Content[] = [];
	let loading = false;
	let showCreateForm = false;

	// Form fields
	let formTitle = '';
	let formDescription = '';
	let formContentType: ContentType = 'article';
	let formDifficulty: DifficultyLevel = 'beginner';
	let formLanguage = 'uk';
	let formUrl = '';
	let formAuthor = '';
	let formTags = '';
	let formDuration: number | undefined = undefined;
	let editingId: string | null = null;

	onMount(async () => {
		if (!$authStore.isAuthenticated) {
			goto('/auth/login');
			return;
		}

		if ($authStore.user?.role !== 'admin') {
			toastStore.trigger({
				message: 'Доступ заборонено. Потрібні права адміністратора.',
				background: 'variant-filled-error'
			});
			goto('/dashboard');
			return;
		}

		await loadContent();
	});

	async function loadContent() {
		loading = true;
		try {
			const response = await contentService.getAll({ limit: 100 });
			if (response.success && response.data) {
				contents = response.data;
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

	function openCreateForm() {
		resetForm();
		editingId = null;
		showCreateForm = true;
	}

	function openEditForm(content: Content) {
		formTitle = content.title;
		formDescription = content.description || '';
		formContentType = content.contentType;
		formDifficulty = content.difficultyLevel || 'beginner';
		formLanguage = content.language || 'uk';
		formUrl = content.url || '';
		formAuthor = content.author || '';
		formTags = content.tags.join(', ');
		formDuration = content.durationMinutes;
		editingId = content.id;
		showCreateForm = true;
	}

	function resetForm() {
		formTitle = '';
		formDescription = '';
		formContentType = 'article';
		formDifficulty = 'beginner';
		formLanguage = 'uk';
		formUrl = '';
		formAuthor = '';
		formTags = '';
		formDuration = undefined;
		editingId = null;
	}

	async function handleSubmit() {
		if (!formTitle) {
			toastStore.trigger({
				message: 'Назва обов\'язкова',
				background: 'variant-filled-warning'
			});
			return;
		}

		loading = true;
		try {
			const contentData = {
				title: formTitle,
				description: formDescription || undefined,
				contentType: formContentType,
				difficultyLevel: formDifficulty,
				language: formLanguage,
				url: formUrl || undefined,
				author: formAuthor || undefined,
				tags: formTags.split(',').map(t => t.trim()).filter(t => t),
				durationMinutes: formDuration || undefined
			};

			if (editingId) {
				await contentService.update(editingId, contentData);
				toastStore.trigger({
					message: 'Контент оновлено успішно!',
					background: 'variant-filled-success'
				});
			} else {
				await contentService.create(contentData);
				toastStore.trigger({
					message: 'Контент створено успішно!',
					background: 'variant-filled-success'
				});
			}

			showCreateForm = false;
			resetForm();
			await loadContent();
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка збереження контенту',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	function confirmDelete(id: string, title: string) {
		const modal: ModalSettings = {
			type: 'confirm',
			title: 'Підтвердження видалення',
			body: `Ви впевнені, що хочете видалити "${title}"?`,
			response: (confirmed: boolean) => {
				if (confirmed) {
					handleDelete(id);
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function handleDelete(id: string) {
		loading = true;
		try {
			await contentService.delete(id);
			toastStore.trigger({
				message: 'Контент видалено',
				background: 'variant-filled-success'
			});
			await loadContent();
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка видалення контенту',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Адмін панель - Рекомендаційна Система</title>
</svelte:head>

<div class="container mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="h1">⚙️ Адмін панель</h1>
		<button
			class="btn variant-filled-primary"
			on:click={openCreateForm}
		>
			➕ Додати контент
		</button>
	</div>

	<!-- Create/Edit Form -->
	{#if showCreateForm}
		<div class="card p-6 space-y-4">
			<h2 class="h2">{editingId ? '✏️ Редагувати контент' : '➕ Створити новий контент'}</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label class="label">
						<span>Назва *</span>
						<input
							type="text"
							class="input"
							bind:value={formTitle}
							required
							disabled={loading}
						/>
					</label>

					<label class="label">
						<span>Автор</span>
						<input
							type="text"
							class="input"
							bind:value={formAuthor}
							disabled={loading}
						/>
					</label>
				</div>

				<label class="label">
					<span>Опис</span>
					<textarea
						class="textarea"
						rows="3"
						bind:value={formDescription}
						disabled={loading}
					/>
				</label>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<label class="label">
						<span>Тип контенту</span>
						<select class="select" bind:value={formContentType} disabled={loading}>
							<option value="course">Курс</option>
							<option value="article">Стаття</option>
							<option value="video">Відео</option>
							<option value="news">Новини</option>
						</select>
					</label>

					<label class="label">
						<span>Складність</span>
						<select class="select" bind:value={formDifficulty} disabled={loading}>
							<option value="beginner">Початковий</option>
							<option value="intermediate">Середній</option>
							<option value="advanced">Просунутий</option>
						</select>
					</label>

					<label class="label">
						<span>Мова</span>
						<select class="select" bind:value={formLanguage} disabled={loading}>
							<option value="uk">Українська</option>
							<option value="en">English</option>
						</select>
					</label>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label class="label">
						<span>URL</span>
						<input
							type="url"
							class="input"
							bind:value={formUrl}
							placeholder="https://..."
							disabled={loading}
						/>
					</label>

					<label class="label">
						<span>Тривалість (хвилини)</span>
						<input
							type="number"
							class="input"
							bind:value={formDuration}
							min="0"
							placeholder="30"
							disabled={loading}
						/>
					</label>
				</div>

				<label class="label">
					<span>Теги (через кому)</span>
					<input
						type="text"
						class="input"
						bind:value={formTags}
						placeholder="javascript, react, frontend"
						disabled={loading}
					/>
				</label>

				<div class="flex gap-2">
					<button
						type="submit"
						class="btn variant-filled-success"
						disabled={loading}
					>
						{loading ? 'Збереження...' : editingId ? '✓ Оновити' : '✓ Створити'}
					</button>
					<button
						type="button"
						class="btn variant-ghost-surface"
						on:click={() => { showCreateForm = false; resetForm(); }}
						disabled={loading}
					>
						Скасувати
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Content List -->
	<div class="card p-6 space-y-4">
		<h2 class="h2">📋 Весь контент ({contents.length})</h2>

		{#if loading && contents.length === 0}
			<div class="flex items-center justify-center p-10">
				<div class="animate-pulse text-lg">Завантаження...</div>
			</div>
		{:else if contents.length === 0}
			<div class="text-center p-10 opacity-70">
				<p>Контент ще не додано</p>
			</div>
		{:else}
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Назва</th>
							<th>Тип</th>
							<th>Складність</th>
							<th>Автор</th>
							<th>Рейтинг</th>
							<th>Перегляди</th>
							<th class="text-right">Дії</th>
						</tr>
					</thead>
					<tbody>
						{#each contents as content}
							<tr>
								<td>
									<a href="/content/{content.id}" class="anchor font-bold">
										{content.title}
									</a>
								</td>
								<td>
									<span class="chip variant-soft text-xs">
										{content.contentType}
									</span>
								</td>
								<td>
									{#if content.difficultyLevel}
										<span class="chip variant-soft text-xs">
											{content.difficultyLevel}
										</span>
									{/if}
								</td>
								<td class="opacity-70">{content.author || '-'}</td>
								<td>⭐ {content.rating.toFixed(1)}</td>
								<td>👁️ {content.viewCount}</td>
								<td>
									<div class="flex gap-2 justify-end">
										<button
											class="btn btn-sm variant-filled-primary"
											on:click={() => openEditForm(content)}
											disabled={loading}
										>
											✏️
										</button>
										<button
											class="btn btn-sm variant-filled-error"
											on:click={() => confirmDelete(content.id, content.title)}
											disabled={loading}
										>
											🗑️
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$stores/auth';
	import { authService } from '$services/auth.service';
	import { goto } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';

	let user = $authStore.user;
	let loading = false;
	let editing = false;

	// Form fields
	let firstName = user?.firstName || '';
	let lastName = user?.lastName || '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	onMount(async () => {
		if (!$authStore.isAuthenticated) {
			goto('/auth/login');
			return;
		}

		// Load fresh user data
		await loadProfile();
	});

	async function loadProfile() {
		loading = true;
		try {
			const userData = await authService.getProfile();
			user = userData;
			firstName = userData.firstName;
			lastName = userData.lastName;
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка завантаження профілю',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	async function handleUpdateProfile() {
		loading = true;
		try {
			await authService.updateProfile({
				firstName,
				lastName
			});

			toastStore.trigger({
				message: 'Профіль оновлено успішно!',
				background: 'variant-filled-success'
			});

			editing = false;
			await loadProfile();
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка оновлення профілю',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	async function handleChangePassword() {
		if (!currentPassword || !newPassword) {
			toastStore.trigger({
				message: 'Заповніть всі поля',
				background: 'variant-filled-warning'
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			toastStore.trigger({
				message: 'Новий пароль та підтвердження не співпадають',
				background: 'variant-filled-error'
			});
			return;
		}

		if (newPassword.length < 6) {
			toastStore.trigger({
				message: 'Пароль повинен містити мінімум 6 символів',
				background: 'variant-filled-warning'
			});
			return;
		}

		loading = true;
		try {
			await authService.updateProfile({
				currentPassword,
				newPassword
			});

			toastStore.trigger({
				message: 'Пароль змінено успішно!',
				background: 'variant-filled-success'
			});

			// Clear password fields
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			toastStore.trigger({
				message: 'Помилка зміни пароля. Перевірте поточний пароль.',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}

	function cancelEdit() {
		editing = false;
		firstName = user?.firstName || '';
		lastName = user?.lastName || '';
	}
</script>

<svelte:head>
	<title>Dashboard - Рекомендаційна Система</title>
</svelte:head>

<div class="container mx-auto max-w-4xl space-y-6">
	<h1 class="h1">👤 Мій Dashboard</h1>

	{#if loading && !user}
		<div class="flex items-center justify-center p-10">
			<div class="animate-pulse text-lg">Завантаження...</div>
		</div>
	{:else if user}
		<!-- Profile Overview -->
		<div class="card p-6 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="h2">Профіль</h2>
				{#if !editing}
					<button
						class="btn variant-filled-primary"
						on:click={() => editing = true}
					>
						✏️ Редагувати
					</button>
				{/if}
			</div>

			{#if editing}
				<!-- Edit mode -->
				<form on:submit|preventDefault={handleUpdateProfile} class="space-y-4">
					<label class="label">
						<span>Ім'я</span>
						<input
							type="text"
							class="input"
							bind:value={firstName}
							required
							disabled={loading}
						/>
					</label>

					<label class="label">
						<span>Прізвище</span>
						<input
							type="text"
							class="input"
							bind:value={lastName}
							required
							disabled={loading}
						/>
					</label>

					<div class="flex gap-2">
						<button
							type="submit"
							class="btn variant-filled-success"
							disabled={loading}
						>
							{loading ? 'Збереження...' : '✓ Зберегти'}
						</button>
						<button
							type="button"
							class="btn variant-ghost-surface"
							on:click={cancelEdit}
							disabled={loading}
						>
							Скасувати
						</button>
					</div>
				</form>
			{:else}
				<!-- View mode -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm opacity-70">Email</p>
						<p class="font-bold">{user.email}</p>
					</div>
					<div>
						<p class="text-sm opacity-70">Роль</p>
						<p class="font-bold">
							<span class="badge variant-filled-primary">{user.role}</span>
						</p>
					</div>
					<div>
						<p class="text-sm opacity-70">Ім'я</p>
						<p class="font-bold">{user.firstName}</p>
					</div>
					<div>
						<p class="text-sm opacity-70">Прізвище</p>
						<p class="font-bold">{user.lastName}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Change Password -->
		<div class="card p-6 space-y-4">
			<h2 class="h2">🔐 Змінити пароль</h2>

			<form on:submit|preventDefault={handleChangePassword} class="space-y-4">
				<label class="label">
					<span>Поточний пароль</span>
					<input
						type="password"
						class="input"
						bind:value={currentPassword}
						placeholder="Введіть поточний пароль"
						disabled={loading}
					/>
				</label>

				<label class="label">
					<span>Новий пароль</span>
					<input
						type="password"
						class="input"
						bind:value={newPassword}
						placeholder="Мінімум 6 символів"
						disabled={loading}
					/>
				</label>

				<label class="label">
					<span>Підтвердження нового пароля</span>
					<input
						type="password"
						class="input"
						bind:value={confirmPassword}
						placeholder="Повторіть новий пароль"
						disabled={loading}
					/>
				</label>

				<button
					type="submit"
					class="btn variant-filled-primary"
					disabled={loading || !currentPassword || !newPassword || !confirmPassword}
				>
					{loading ? 'Оновлення...' : 'Змінити пароль'}
				</button>
			</form>
		</div>

		<!-- Quick Links -->
		<div class="card p-6 space-y-4">
			<h2 class="h2">🚀 Швидкі посилання</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a href="/recommendations" class="card card-hover p-4 text-center space-y-2">
					<div class="text-3xl">✨</div>
					<h3 class="h4">Рекомендації</h3>
					<p class="text-sm opacity-70">Персоналізований контент</p>
				</a>

				<a href="/content" class="card card-hover p-4 text-center space-y-2">
					<div class="text-3xl">📚</div>
					<h3 class="h4">Весь контент</h3>
					<p class="text-sm opacity-70">Переглянути каталог</p>
				</a>

				{#if user.role === 'admin'}
					<a href="/admin" class="card card-hover p-4 text-center space-y-2">
						<div class="text-3xl">⚙️</div>
						<h3 class="h4">Адмін панель</h3>
						<p class="text-sm opacity-70">Управління контентом</p>
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>

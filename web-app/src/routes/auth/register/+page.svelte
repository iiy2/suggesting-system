<script lang="ts">
	import { authService } from '$services/auth.service';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let loading = false;

	async function handleSubmit() {
		if (password !== confirmPassword) {
			toastStore.trigger({
				message: 'Паролі не співпадають',
				background: 'variant-filled-error'
			});
			return;
		}

		loading = true;
		try {
			await authService.register(email, password, firstName, lastName);
			toastStore.trigger({
				message: 'Реєстрація успішна!',
				background: 'variant-filled-success'
			});
			goto('/dashboard');
		} catch (error: any) {
			toastStore.trigger({
				message: error.response?.data?.message || 'Помилка реєстрації',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Реєстрація</title>
</svelte:head>

<div class="container max-w-md mx-auto py-10">
	<div class="card p-8 space-y-6">
		<h1 class="h1 text-center">Реєстрація</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<label class="label">
					<span>Ім'я</span>
					<input 
						type="text" 
						class="input" 
						placeholder="Іван"
						bind:value={firstName}
						required
					/>
				</label>

				<label class="label">
					<span>Прізвище</span>
					<input 
						type="text" 
						class="input" 
						placeholder="Іваненко"
						bind:value={lastName}
						required
					/>
				</label>
			</div>

			<label class="label">
				<span>Email</span>
				<input 
					type="email" 
					class="input" 
					placeholder="your@email.com"
					bind:value={email}
					required
				/>
			</label>

			<label class="label">
				<span>Пароль</span>
				<input 
					type="password" 
					class="input" 
					placeholder="********"
					bind:value={password}
					required
					minlength="6"
				/>
			</label>

			<label class="label">
				<span>Підтвердіть пароль</span>
				<input 
					type="password" 
					class="input" 
					placeholder="********"
					bind:value={confirmPassword}
					required
					minlength="6"
				/>
			</label>

			<button 
				type="submit" 
				class="btn variant-filled-primary w-full"
				disabled={loading}
			>
				{loading ? 'Реєстрація...' : 'Зареєструватись'}
			</button>
		</form>

		<div class="text-center">
			<p class="text-sm">
				Вже є акаунт? 
				<a href="/auth/login" class="anchor">Увійти</a>
			</p>
		</div>
	</div>
</div>

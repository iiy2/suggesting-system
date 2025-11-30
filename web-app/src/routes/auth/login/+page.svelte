<script lang="ts">
	import { authService } from '$services/auth.service';
	import { goto } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';

	let email = '';
	let password = '';
	let loading = false;

	async function handleSubmit() {
		loading = true;
		try {
			await authService.login(email, password);
			toastStore.trigger({
				message: 'Успішно увійшли!',
				background: 'variant-filled-success'
			});
			goto('/dashboard');
		} catch (error: any) {
			toastStore.trigger({
				message: error.response?.data?.message || 'Помилка входу',
				background: 'variant-filled-error'
			});
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Вхід</title>
</svelte:head>

<div class="container max-w-md mx-auto py-10">
	<div class="card p-8 space-y-6">
		<h1 class="h1 text-center">Вхід</h1>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
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

			<button 
				type="submit" 
				class="btn variant-filled-primary w-full"
				disabled={loading}
			>
				{loading ? 'Вхід...' : 'Увійти'}
			</button>
		</form>

		<div class="text-center">
			<p class="text-sm">
				Немає акаунту? 
				<a href="/auth/register" class="anchor">Зареєструватись</a>
			</p>
		</div>
	</div>
</div>

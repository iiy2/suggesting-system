<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$stores/auth';
	import { AppShell } from '@skeletonlabs/skeleton';
	import Navigation from '$components/Navigation.svelte';
	import { initializeStores, Modal, Toast } from '@skeletonlabs/skeleton';

	// Initialize Skeleton stores
	initializeStores();

	onMount(() => {
		// Initialize auth store from localStorage
		authStore.init();
	});
</script>

<Modal />
<Toast />

<AppShell>
	<svelte:fragment slot="header">
		<Navigation />
	</svelte:fragment>

	<div class="container mx-auto p-4 space-y-4">
		<slot />
	</div>
</AppShell>

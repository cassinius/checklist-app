<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="px-1.5 py-1">
	{@render children()}
</div>

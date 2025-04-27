<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="px-1.5 py-1 flex flex-col h-screen">
  <header class="bg-white border-b border-gray-200 p-4 shadow-sm">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-orange-500">Checklist Timeline</h1>
    </div>
  </header>

  <div class="flex flex-1 overflow-hidden">
		{@render children()}
  </div>
</div>
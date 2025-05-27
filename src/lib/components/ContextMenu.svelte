<!-- src/lib/components/ContextMenu.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let x: number;
  export let y: number;
  export let itemId: string;
  export let show: boolean;

  const dispatch = createEventDispatcher<{
    delete: { itemId: string };
    close: void;
  }>();

  function handleDelete() {
    dispatch('delete', { itemId });
    // Parent (Sidebar.svelte) handles closing the menu after this action.
  }

  let menuElement: HTMLDivElement | null = null;

  function handleClickOutside(event: MouseEvent) {
    if (show && menuElement && !menuElement.contains(event.target as Node)) {
      // The check for '.context-menu-trigger-active' is removed for simplicity as
      // the menu is triggered by 'contextmenu' event, not 'click'.
      // If the trigger was a click, that logic would be more relevant to prevent
      // immediate re-closing if the trigger element is clicked again.
      dispatch('close');
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside, true); // Use capture phase
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside, true);
  });

</script>

{#if show}
  <div
    bind:this={menuElement}
    class="absolute bg-white border border-gray-300 rounded-md shadow-lg p-1 z-50"
    style="top: {y}px; left: {x}px; min-width: 120px;"
  >
    <ul class="space-y-1">
      <li>
        <button
          on:click|stopPropagation={handleDelete} 
          class="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-red-500 hover:text-white rounded focus:outline-none focus:bg-red-500 focus:text-white"
          title="Delete Item"
        >
          Delete
        </button>
      </li>
      <!-- Future menu items can be added here -->
      <!-- Example:
      <li>
        <button
          on:click={() => { dispatch('edit', { itemId }); dispatch('close'); }}
          class="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:bg-gray-100"
        >
          Edit
        </button>
      </li>
      -->
    </ul>
  </div>
{/if}

<style>
  /* Optional: If you need to add specific styles not covered by Tailwind */
  /* For example, ensuring the button text is aligned or specific focus styles */
  button {
    transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
  }
</style>

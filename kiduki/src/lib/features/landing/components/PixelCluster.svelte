<script lang="ts">
let { compact = false }: { compact?: boolean } = $props();

const cell = $derived(compact ? "size-[9.6px]" : "size-4");
</script>

<div aria-hidden="true" class="grid grid-cols-4 {compact ? "w-12 gap-[2.4px]" : "w-20 gap-1"}">
  <span class="{cell} bg-[var(--kiduki-green-500)]"></span>
  <span class="{cell} bg-[rgb(73_175_51/0.7)]"></span>
  <span class="{cell} bg-[rgb(73_175_51/0.4)]"></span>
  <span class="{cell} bg-[rgb(73_175_51/0.25)]"></span>
  <span class="{cell} bg-[rgb(73_175_51/0.7)]"></span>
  <span class="{cell} bg-[var(--kiduki-green-500)]"></span>
  <span class="{cell} col-start-1 bg-[rgb(73_175_51/0.4)]"></span>
</div>

<script lang="ts">
import { LandingPage, landingContent } from "$lib/features/landing";
</script>

<svelte:head>
  <title>{landingContent.meta.title}</title>
  <meta name="description" content={landingContent.meta.description}>
</svelte:head>

<LandingPage />

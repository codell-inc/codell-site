<script lang="ts">
import type { Attachment } from "svelte/attachments";
import { isConfiguredHref, landingContent, pendingMarker, unconfirmedMarker } from "../content";
import { observeHeroVisibility } from "../hero-visibility";
import PixelCluster from "./PixelCluster.svelte";

let heroVisible = $state(true);
const configuredSupportLinks = landingContent.support.links.filter((link) =>
  isConfiguredHref(link.href),
);
const configuredLegalLinks = landingContent.legal.filter((link) => isConfiguredHref(link.href));
const showSupport = configuredSupportLinks.length > 0 || landingContent.support.rows.length > 0;
const trackHeroVisibility: Attachment<HTMLElement> = (node) =>
  observeHeroVisibility(node, (visible) => {
    heroVisible = visible;
  });

const eyebrowClass =
  "font-sans text-sm font-semibold tracking-[0.16em] text-[var(--kiduki-green-500)]";
const sectionTitleClass = "text-[24px] font-bold leading-[1.5] text-[#1f2a1c] lg:text-[32px]";
const solidButtonClass =
  "inline-flex items-center justify-center rounded-full bg-[var(--kiduki-green-500)] font-bold leading-[1.5] text-white transition-opacity motion-reduce:transition-none hover:opacity-90";
const inverseButtonClass =
  "inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-[16px] font-bold leading-[1.5] text-[var(--kiduki-green-500)] transition-opacity motion-reduce:transition-none hover:opacity-90";

function footerValueClass(value: string): string {
  return value === pendingMarker || value === unconfirmedMarker
    ? "text-[#ff6b5e]"
    : "text-[#cfd8cb]";
}
</script>

{#snippet sectionHeading(
  eyebrow: string,
  title: string,
  headingId: string,
)}
  <div class="flex flex-col items-center gap-2 text-center">
    <p class={eyebrowClass}>{eyebrow}</p>
    <h2 id={headingId} class={sectionTitleClass}>{title}</h2>
  </div>
{/snippet}

{#snippet rokidTrademarkText()}
  {landingContent.rokidTrademark.before}<span class="whitespace-nowrap"
    >{landingContent.rokidTrademark.name}</span
  >{landingContent.rokidTrademark.after}
{/snippet}

{#snippet footerRows(
  rows: readonly { label: string; value: string; href?: string }[],
)}
  {#each rows as row (row.label)}
    <div class="flex w-full items-start gap-4 text-[13px] leading-[1.6]">
      <span class="w-14 shrink-0 text-[#8fa08a]">{row.label}</span>
      {#if row.href && isConfiguredHref(row.href)}
        <a class="min-w-0 font-sans text-[14px] text-[#cfd8cb] hover:underline" href={row.href}>
          {row.value}
        </a>
      {:else}
        <span class="min-w-0 {footerValueClass(row.value)}">{row.value}</span>
      {/if}
    </div>
  {/each}
{/snippet}

<a
  class="absolute top-0 left-5 z-50 -translate-y-full bg-[#1f2a1c] px-4 py-3 text-sm font-bold text-white transition-transform motion-reduce:transition-none focus:translate-y-0"
  href="#main-content"
>
  本文へ移動
</a>

<div class="bg-[#faf8f2] font-sans text-[#1f2a1c]">
  <header
    class="sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md transition-colors duration-300 motion-reduce:transition-none lg:px-16"
    class:bg-transparent={heroVisible}
    class:bg-white={!heroVisible}
  >
    <a class="shrink-0" href="/" aria-label="KiDUKi トップへ">
      <img
        src={landingContent.logos.kiduki}
        alt="KiDUKi"
        width="148"
        height="32"
        class="h-6 w-[111px] lg:h-8 lg:w-[148px]"
      >
    </a>

    <nav aria-label="サイト内ナビゲーション" class="hidden items-center gap-8 lg:flex">
      {#each landingContent.nav as item (item.href)}
        <a
          class="text-[15px] font-medium leading-[1.5] text-[#1f2a1c] decoration-[var(--kiduki-green-500)] decoration-2 underline-offset-8 hover:underline"
          href={item.href}
        >
          {item.label}
        </a>
      {/each}
    </nav>

    <a
      href={landingContent.contact.href}
      class="{solidButtonClass} px-4 py-2 text-[13px] lg:px-8 lg:py-4 lg:text-[16px]"
    >
      {landingContent.contact.label}
    </a>
  </header>

  <main id="main-content">
    <section {@attach trackHeroVisibility} aria-label={landingContent.hero.label} class="w-full">
      <video
        class="block aspect-video h-auto w-full object-contain"
        autoplay
        muted
        loop
        playsinline
        poster={landingContent.hero.poster}
        preload="metadata"
      >
        <source src={landingContent.hero.src} type="video/mp4">
      </video>
    </section>

    <section
      class="relative overflow-hidden bg-white px-6 py-16 lg:px-16 lg:py-24"
      aria-labelledby="tagline-title"
    >
      <div class="pointer-events-none absolute top-2 left-2 lg:top-6 lg:left-14">
        <div class="lg:hidden"><PixelCluster compact /></div>
        <div class="hidden lg:block"><PixelCluster /></div>
      </div>
      <div
        class="pointer-events-none absolute right-2 bottom-6 rotate-180 lg:right-14 lg:bottom-10"
      >
        <div class="lg:hidden"><PixelCluster compact /></div>
        <div class="hidden lg:block"><PixelCluster /></div>
      </div>

      <div
        class="relative mx-auto flex max-w-5xl flex-col items-center gap-8 text-center lg:gap-12"
      >
        <div class="flex flex-col gap-4">
          <h1
            id="tagline-title"
            class="text-[26px] font-bold leading-[1.5] max-[389px]:text-[24px] lg:text-[40px] xl:text-[48px]"
          >
            <span class="lg:hidden">
              {#each landingContent.tagline.mobileLines as line, index (line)}
                {#if index > 0}
                  <br>
                {/if}
                {line}
              {/each}
            </span>
            <span class="hidden lg:inline">
              {#each landingContent.tagline.desktopLines as line, index (line)}
                {#if index > 0}
                  <br>
                {/if}
                <span class="whitespace-nowrap">{line}</span>
              {/each}
            </span>
          </h1>
          <p class="text-[15px] leading-[1.5] text-[#5e6a5a] lg:text-[20px]">
            {landingContent.tagline.subtitle}
          </p>
        </div>
        <a href={landingContent.contact.href} class={`${solidButtonClass} px-8 py-4 text-[16px]`}>
          {landingContent.contact.label}
        </a>
      </div>
    </section>

    <section class="px-6 py-12 text-center lg:p-16" aria-label={landingContent.lead.text}>
      <p class="text-[22px] font-bold leading-[1.5] lg:text-[32px]">
        <span class="lg:hidden">
          {#each landingContent.lead.mobileLines as line, index (line)}
            {#if index > 0}
              <br>
            {/if}
            {line}
          {/each}
        </span>
        <span class="hidden lg:inline">{landingContent.lead.text}</span>
      </p>
    </section>

    <section
      id={landingContent.features.id}
      aria-labelledby="features-title"
      class="flex flex-col items-center gap-8 px-6 py-16 lg:gap-12 lg:px-16 lg:py-24"
    >
      {@render sectionHeading(landingContent.features.eyebrow, landingContent.features.title, "features-title")}
      <div class="grid w-full gap-6 lg:grid-cols-3">
        {#each landingContent.features.items as feature (feature.number)}
          <article class="flex flex-col gap-4 rounded-3xl bg-white px-4 pt-4 pb-6">
            <img
              src={feature.image}
              alt={feature.imageAlt}
              width="1920"
              height="1080"
              class="h-[174px] w-full rounded-2xl object-cover lg:h-[219px]"
            >
            <div class="flex items-center gap-3">
              <span class="font-sans text-[28px] font-semibold text-[var(--kiduki-green-500)]">
                {feature.number}
              </span>
              <h3 class="text-[22px] font-bold leading-[1.5]">{feature.title}</h3>
            </div>
            <p class="text-[16px] leading-[1.5] text-[#5e6a5a]">{feature.description}</p>
          </article>
        {/each}
      </div>
    </section>

    <section
      id={landingContent.useCases.id}
      aria-labelledby="use-cases-title"
      class="flex flex-col items-center gap-8 bg-white px-6 py-16 lg:gap-12 lg:px-16 lg:py-24"
    >
      {@render sectionHeading(landingContent.useCases.eyebrow, landingContent.useCases.title, "use-cases-title")}
      <div class="grid w-full gap-6 lg:grid-cols-2">
        {#each landingContent.useCases.items as useCase (useCase.title)}
          <article class="flex flex-col items-center gap-4 rounded-3xl bg-[#eef6ea] px-4 pt-4 pb-6">
            <img
              src={useCase.image}
              alt={useCase.imageAlt}
              width="1920"
              height="1080"
              class="h-[174px] w-full rounded-2xl object-cover lg:h-[344px]"
            >
            <h3 class="text-[24px] font-bold leading-[1.5]">{useCase.title}</h3>
          </article>
        {/each}
      </div>
    </section>

    <section
      aria-labelledby="device-title"
      class="relative flex flex-col items-center gap-8 overflow-hidden bg-[#eef6ea] px-6 py-16 lg:gap-12 lg:px-16 lg:py-24"
    >
      <div class="pointer-events-none absolute top-6 left-4 lg:left-14">
        <PixelCluster />
      </div>
      {@render sectionHeading(landingContent.device.eyebrow, landingContent.device.title, "device-title")}
      <div
        class="flex w-full max-w-[1040px] flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-12"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-4">
          <p class="text-[18px] font-bold leading-[1.5] lg:text-[22px]">
            {#each landingContent.device.heading as line, index (line)}
              {#if index > 0}
                <br>
              {/if}
              {line}
            {/each}
          </p>
          <p class="text-[15px] leading-[1.5] text-[#5e6a5a]">
            {#each landingContent.device.body as line, index (line)}
              {#if index > 0}
                <br>
              {/if}
              {line}
            {/each}
          </p>
          <p class="text-[12px] leading-[1.5] text-[#8a9486]">
            {#if landingContent.rokidTrademark.name}
              {@render rokidTrademarkText()}
              <br>
            {/if}
            {#each landingContent.device.disclaimer as line, index (line)}
              {#if index > 0}
                <br>
              {/if}
              {line}
            {/each}
          </p>
        </div>
        <dl class="w-full min-w-0 flex-1 rounded-3xl bg-white px-6 py-2 text-[15px] leading-[1.5]">
          {#each landingContent.device.specs as spec, index (spec.label)}
            <div
              class="flex items-start justify-between gap-4 py-4 {index < landingContent.device.specs.length - 1 ? "border-b border-[#e3e8e0]" : ""}"
            >
              <dt class="font-medium">{spec.label}</dt>
              <dd class="text-[#1f2a1c]">
                {spec.value}
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    </section>

    <section
      id={landingContent.media.id}
      aria-labelledby="media-title"
      class="flex flex-col items-center gap-8 bg-white px-6 py-16 lg:gap-12 lg:px-16 lg:py-24"
    >
      {@render sectionHeading(landingContent.media.eyebrow, landingContent.media.title, "media-title")}
      <p class="max-w-3xl text-center text-[15px] leading-[1.7] text-[#5e6a5a] lg:text-[16px]">
        {landingContent.media.lead}
      </p>
      <div class="flex w-full max-w-[1040px] flex-col gap-10">
        {#each landingContent.media.groups as group (group.id)}
          <div class="flex flex-col gap-4">
            <h3 class="text-[18px] font-bold leading-[1.5] lg:text-[20px]">{group.title}</h3>
            <div class="border-t border-[#e3e8e0]">
              {#each group.items as item (item.href)}
                <article class="flex flex-col gap-2 border-b border-[#e3e8e0] py-6">
                  <p class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span class="font-sans text-[15px] font-medium text-[var(--kiduki-green-500)]">
                      {item.date}
                    </span>
                    <span class="text-[15px] font-bold leading-[1.5]">{item.outlet}</span>
                  </p>
                  <h4 class="text-[16px] font-bold leading-[1.5] lg:text-[18px]">
                    <a
                      class="decoration-[var(--kiduki-green-500)] decoration-2 underline-offset-4 hover:underline"
                      href={item.href}
                      target="_blank"
                      rel="noopener"
                    >
                      {item.title}
                      <span class="sr-only">（新しいタブで開く）</span>
                    </a>
                  </h4>
                  <p class="text-[15px] leading-[1.7] text-[#5e6a5a]">{item.description}</p>
                </article>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section
      id={landingContent.closing.id}
      aria-labelledby="contact-title"
      class="relative flex flex-col items-center gap-8 overflow-hidden bg-[var(--kiduki-green-500)] px-6 py-16 text-center text-white lg:px-16 lg:py-24"
    >
      <div class="pointer-events-none absolute top-2 right-2 lg:top-6 lg:right-14">
        <div class="lg:hidden"><PixelCluster compact /></div>
        <div class="hidden lg:block"><PixelCluster /></div>
      </div>
      <h2 id="contact-title" class="text-[24px] font-bold leading-[1.5] lg:text-[40px]">
        <span class="lg:hidden">
          {#each landingContent.closing.mobileLines as line, index (line)}
            {#if index > 0}
              <br>
            {/if}
            {line}
          {/each}
        </span>
        <span class="hidden lg:inline">{landingContent.closing.title}</span>
      </h2>
      <a href={landingContent.contact.href} class={inverseButtonClass}>
        {landingContent.contact.label}
      </a>
    </section>
  </main>

  <footer class="flex flex-col gap-12 bg-[#1f2a1c] px-6 pt-16 pb-8 text-white lg:px-16">
    <img
      src={landingContent.logos.codell}
      alt="Codell"
      width="120"
      height="46"
      class="h-10 w-[104px] object-contain object-left lg:h-[46px] lg:w-[120px]"
    >

    <div class="flex flex-col gap-12 lg:flex-row">
      <section aria-labelledby="company-title" class="flex w-full min-w-0 flex-col gap-4 lg:flex-1">
        <h2 id="company-title" class="text-[14px] font-bold leading-[1.6]">
          {landingContent.company.title}
        </h2>
        <div class="flex w-full items-start gap-4 text-[13px] leading-[1.6]">
          <span class="w-14 shrink-0 text-[#8fa08a]">社名</span>
          <a class="min-w-0 text-[#cfd8cb] underline" href={landingContent.company.href}>
            {landingContent.company.name}
          </a>
        </div>
        {#if landingContent.company.address}
          <div class="flex w-full items-start gap-4 text-[13px] leading-[1.6]">
            <span class="w-14 shrink-0 text-[#8fa08a]">所在地</span>
            <span class="min-w-0 text-[#cfd8cb]">{landingContent.company.address}</span>
          </div>
        {/if}
      </section>

      <section
        aria-labelledby="footer-contact-title"
        class="flex w-full min-w-0 flex-col gap-4 lg:flex-1"
      >
        <h2 id="footer-contact-title" class="text-[14px] font-bold leading-[1.6]">
          {landingContent.contact.label}
        </h2>
        <a
          class="text-[13px] leading-[1.6] text-[#cfd8cb] hover:underline"
          href={landingContent.contact.href}
        >
          {landingContent.contact.note}
        </a>
      </section>

      {#if showSupport}
        <section aria-labelledby="support-title" class="flex flex-col gap-4 lg:flex-1">
          <h2 id="support-title" class="text-[14px] font-bold leading-[1.6]">
            {landingContent.support.title}
          </h2>
          {#if configuredSupportLinks.length > 0}
            <nav aria-label="サポート" class="flex flex-col gap-4">
              {#each configuredSupportLinks as link (link.label)}
                <a
                  class="text-[13px] leading-[1.6] text-[#cfd8cb] hover:underline"
                  href={link.href}
                >
                  {link.label}
                </a>
              {/each}
            </nav>
          {/if}
          {@render footerRows(landingContent.support.rows)}
        </section>
      {/if}
    </div>

    <div
      class="flex flex-col items-start gap-4 border-t border-[#3a4636] pt-6 text-[12px] leading-[1.6] text-[#8fa08a] lg:flex-row lg:items-center lg:gap-10"
    >
      {#if configuredLegalLinks.length > 0}
        <nav aria-label="法務" class="flex gap-6">
          {#each configuredLegalLinks as link (link.label)}
            <a class="hover:underline" href={link.href}>{link.label}</a>
          {/each}
        </nav>
      {/if}
      {#if landingContent.rokidTrademark.name}
        <p class="w-full lg:w-auto lg:min-w-0 lg:flex-1 lg:text-right">
          {@render rokidTrademarkText()}
        </p>
      {/if}
      <p class="font-sans {landingContent.rokidTrademark.name ? "" : "lg:ml-auto"}">
        {landingContent.copyright}
      </p>
    </div>
  </footer>
</div>

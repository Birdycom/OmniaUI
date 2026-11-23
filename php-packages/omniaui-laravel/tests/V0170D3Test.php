<?php

// File: tests/V0170D3Test.php
// Map: 0.17.0 D3: compound tabs (list / trigger / content, active value, Livewire model) -> compound dialog (trigger /
//      content / header / title / description / body / footer / close, invoker commands, Livewire model) -> compound
//      popover (trigger / content, side / align / offset, model) -> tooltip content slot / open / delay -> app-header
//      overflow + search slot -> old props APIs unchanged

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170D3Test extends TestCase
{
    private const TABS = '<x-oc::tabs name="t1" active="team" module="green">'
        .'<x-oc::tabs.list label="Sections"><x-oc::tabs.trigger value="profile">Profile</x-oc::tabs.trigger><x-oc::tabs.trigger value="team" count="3" tone="info">Team</x-oc::tabs.trigger></x-oc::tabs.list>'
        .'<x-oc::tabs.content value="profile">Panel P</x-oc::tabs.content><x-oc::tabs.content value="team">Panel T</x-oc::tabs.content>'
        .'</x-oc::tabs>';

    public function test_compound_tabs_render_list_triggers_and_panels(): void
    {
        $html = $this->render(self::TABS);
        $this->assertElement($html, 'div', 'oc-tabs', ['data-module' => 'green']);
        $this->assertElement($html, 'div', 'oc-tab-list', ['role' => 'tablist', 'aria-label' => 'Sections', 'data-oc-tabs' => null]);
        $this->assertElement($html, 'button', 'oc-tab-trigger', ['id' => 't1-tab-team', 'aria-selected' => 'true', 'aria-controls' => 't1-team', 'role' => 'tab']);
        $this->assertElement($html, 'button', 'oc-tab-trigger', ['id' => 't1-tab-profile', 'aria-selected' => 'false']);
        $this->assertElement($html, 'div', 'oc-tab-panel is-active', ['id' => 't1-team', 'role' => 'tabpanel', 'aria-labelledby' => 't1-tab-team'], 'Panel T');
        $this->assertElement($html, 'div', 'oc-tab-panel', ['id' => 't1-profile'], 'Panel P');
        $this->assertElement($html, 'span', 'oc-data-table-tab-count oc-data-table-tab-count--info', [], '3');
        $this->assertStringNotContainsString('oc-tabset', $html);
        $this->assertStringNotContainsString('wire:click', $html);
    }

    public function test_compound_tabs_livewire_model_sets_the_property(): void
    {
        $html = $this->render(str_replace('module="green"', 'model="tab"', self::TABS));
        $this->assertStringContainsString('wire:click="$set(&#039;tab&#039;, &#039;team&#039;)"', $html);
        $html = $this->render(str_replace('module="green"', 'wire:model="tab"', self::TABS));
        $this->assertStringContainsString('wire:click="$set(&#039;tab&#039;, &#039;profile&#039;)"', $html);
        // wire:model is not left on the root <div>.
        $this->assertStringNotContainsString('<div wire:model', $html);
        $this->assertStringNotContainsString('class="oc-tabs" wire:model', $html);
    }

    public function test_tabs_props_api_unchanged(): void
    {
        $html = $this->render('<x-oc::tabs name="old" :tabs="[\'One\', \'Two\']"><x-oc::tabs.panel>A</x-oc::tabs.panel><x-oc::tabs.panel>B</x-oc::tabs.panel></x-oc::tabs>');
        $this->assertElement($html, 'div', 'oc-tabset');
        $this->assertStringContainsString('type="radio" name="old"', $html);
        $this->assertStringNotContainsString('data-module', $html);
    }

    public function test_compound_dialog_uses_invoker_commands(): void
    {
        $html = $this->render('<x-oc::dialog id="edit"><x-oc::dialog.trigger variant="outline">Edit</x-oc::dialog.trigger>'
            .'<x-oc::dialog.content size="lg" scroll><x-oc::dialog.header><x-oc::dialog.title>Edit customer</x-oc::dialog.title><x-oc::dialog.description>Customer 1</x-oc::dialog.description></x-oc::dialog.header>'
            .'<x-oc::dialog.body>Body</x-oc::dialog.body><x-oc::dialog.footer><x-oc::dialog.close>Cancel</x-oc::dialog.close></x-oc::dialog.footer></x-oc::dialog.content></x-oc::dialog>');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['command' => 'show-modal', 'commandfor' => 'edit', 'aria-haspopup' => 'dialog'], 'Edit');
        $this->assertElement($html, 'dialog', 'oc-modal', ['id' => 'edit', 'closedby' => 'any', 'aria-labelledby' => 'edit-title', 'aria-describedby' => 'edit-description']);
        $this->assertElement($html, 'div', 'oc-modal-content oc-modal-content--lg oc-modal-content--scroll');
        $this->assertElement($html, 'button', 'oc-modal-close', ['command' => 'close', 'commandfor' => 'edit', 'aria-label' => 'Close']);
        $this->assertElement($html, 'h2', 'oc-modal-title', ['id' => 'edit-title'], 'Edit customer');
        $this->assertElement($html, 'p', 'oc-modal-description', ['id' => 'edit-description'], 'Customer 1');
        $this->assertElement($html, 'div', 'oc-modal-body', [], 'Body');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['command' => 'close', 'commandfor' => 'edit'], 'Cancel');
        $this->assertStringNotContainsString('x-data', $html);
    }

    public function test_compound_dialog_livewire_model(): void
    {
        $html = $this->render('<x-oc::dialog id="d2" model="editing"><x-oc::dialog.trigger>Open</x-oc::dialog.trigger><x-oc::dialog.content :close-button="false">X</x-oc::dialog.content></x-oc::dialog>');
        $this->assertStringContainsString('wire:click="$set(&#039;editing&#039;, true)"', $html);
        $this->assertStringNotContainsString('command="show-modal"', $html);
        $this->assertStringContainsString('wire:ignore.self', $html);
        $this->assertStringContainsString("\$wire.entangle('editing')", $html);
        $this->assertStringNotContainsString('oc-modal-close', $html);
    }

    public function test_compound_popover_trigger_and_content(): void
    {
        $html = $this->render('<x-oc::popover id="filters"><x-oc::popover.trigger>Filter</x-oc::popover.trigger><x-oc::popover.content side="top" align="center" offset="8" title="Filters">Body</x-oc::popover.content></x-oc::popover>');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['popovertarget' => 'filters', 'aria-controls' => 'filters'], 'Filter');
        $this->assertElement($html, 'div', 'oc-popover', ['id' => 'filters', 'popover' => null, 'data-side' => 'top', 'data-align' => 'center', 'style' => '--oc-popover-offset: 8px', 'role' => 'dialog']);
        $this->assertSame(1, substr_count($html, '<button'), 'no extra default trigger button');
        $this->assertStringNotContainsString('x-data', $html);

        $wired = $this->render('<x-oc::popover id="p2" model="filtersOpen"><x-oc::popover.trigger>F</x-oc::popover.trigger><x-oc::popover.content>B</x-oc::popover.content></x-oc::popover>');
        $this->assertStringContainsString("\$wire.entangle('filtersOpen')", $wired);
        $this->assertStringContainsString('x-on:toggle=', $wired);
    }

    public function test_popover_props_api_unchanged(): void
    {
        $html = $this->render('<x-oc::popover id="old" trigger="Open it" title="T">Body</x-oc::popover>');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['popovertarget' => 'old'], 'Open it');
        $this->assertElement($html, 'div', 'oc-popover', ['id' => 'old', 'popover' => null]);
        $this->assertStringNotContainsString('data-side', $html);
    }

    public function test_tooltip_content_slot_open_and_delay(): void
    {
        $html = $this->render('<x-oc::tooltip content-id="tt1" :open="true" delay="300"><button>Info</button><x-slot:content>Due <strong>today</strong></x-slot:content></x-oc::tooltip>');
        $this->assertElement($html, 'span', 'oc-tooltip is-open', ['aria-describedby' => 'tt1', 'style' => '--oc-tooltip-delay: 300ms']);
        $this->assertElement($html, 'span', 'oc-tooltip__content', ['id' => 'tt1', 'role' => 'tooltip']);
        $this->assertStringContainsString('<strong>today</strong>', $html);
        $this->assertStringNotContainsString('data-tooltip', $html);

        $closed = $this->render('<x-oc::tooltip text="Plain" :open="false"><span>X</span></x-oc::tooltip>');
        $this->assertElement($closed, 'span', 'oc-tooltip is-closed', ['data-tooltip' => 'Plain']);

        $old = $this->render('<x-oc::tooltip text="Lines" heading="Title"><span>Y</span></x-oc::tooltip>');
        $this->assertElement($old, 'span', 'oc-tooltip');
        $this->assertStringContainsString('<span class="oc-tooltip__content" role="tooltip"><span class="oc-tooltip__title">Title</span>Lines</span>', $old);
        $this->assertStringNotContainsString('aria-describedby', $old);
    }

    public function test_app_header_overflow_and_search(): void
    {
        $html = $this->render('<x-oc::block.app-header :overflow="true" more-label="More" module="blue"><x-slot:search><input class="oc-input" type="search" aria-label="Search"></x-slot:search></x-oc::block.app-header>');
        $this->assertElement($html, 'header', 'oc-block-appbar', ['data-module' => 'blue']);
        $this->assertElement($html, 'nav', 'oc-block-appbar-nav', ['data-oc-nav-overflow' => null, 'data-more-label' => 'More', 'aria-label' => 'Module navigation']);
        $this->assertElement($html, 'button', 'oc-navmenu-link oc-block-appbar-more', ['aria-haspopup' => 'menu']);
        $this->assertStringContainsString('<li data-oc-nav-more data-oc-hidden aria-hidden="true">', $html);
        $this->assertStringContainsString('data-icon="mdi:dots-horizontal"', $html);
        $this->assertMatchesRegularExpression('#</nav> <div class="oc-block-appbar-search"><input class="oc-input" type="search" aria-label="Search"></div> <div class="oc-block-appbar-actions">#', $html);
    }

    public function test_app_header_default_unchanged(): void
    {
        $html = $this->render('<x-oc::block.app-header />');
        $this->assertStringContainsString('<nav class="oc-block-appbar-nav" aria-label="Module navigation">', $html);
        $this->assertStringNotContainsString('data-oc-nav-more', $html);
        $this->assertStringNotContainsString('oc-block-appbar-search', $html);
        $this->assertStringNotContainsString('data-module', $html);
        $this->assertStringContainsString('for="oc-appbar-toggle"', $html);
    }
}

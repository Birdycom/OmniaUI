<?php

// File: tests/V0170R3ATest.php
// Map: 0.17.0 round 3 (A): dropdown toggle mode -> dropdown item / label / separator / sub -> menubar item attributes + menu slot
//      -> accordion script mode -> card action / text / link / grid -> button-group.text + item.separator -> date picker / search webicons

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170R3ATest extends TestCase
{
    public function test_dropdown_popover_mode_stays_the_same(): void
    {
        $html = $this->render('<x-oc::dropdown id="m1" label="Options" />');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['popovertarget' => 'm1']);
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => 'm1', 'popover' => null]);
        $this->assertStringNotContainsString('oc-dropdown"', $html);
        $this->assertStringNotContainsString('<script', $html);
    }

    public function test_dropdown_toggle_mode_with_script(): void
    {
        $html = $this->render('<x-oc::dropdown mode="toggle" id="m2" label="Options" :items="[[\'label\' => \'Profile\', \'href\' => \'/profile\']]" />');
        $this->assertElement($html, 'div', 'oc-dropdown', ['data-oc-dropdown' => null]);
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['type' => 'button', 'aria-expanded' => 'false', 'aria-controls' => 'm2']);
        $this->assertStringNotContainsString('popover', $html);
        $this->assertElement($html, 'a', 'oc-dropdown-item', ['href' => '/profile'], 'Profile');
        $this->assertStringContainsString('[data-oc-dropdown]', $html);
    }

    public function test_dropdown_toggle_mode_for_livewire(): void
    {
        $html = $this->render('<x-oc::dropdown mode="toggle" open :script="false" id="m3" :trigger-attributes="[\'wire:click\' => \'toggle\']" />');
        $this->assertElement($html, 'div', 'oc-dropdown is-open');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['wire:click' => 'toggle', 'aria-expanded' => 'true']);
        $this->assertStringNotContainsString('data-oc-dropdown', $html);
        $this->assertStringNotContainsString('<script', $html);
    }

    public function test_dropdown_item_variants(): void
    {
        $link = $this->render('<x-oc::dropdown.item href="/profile">Profile</x-oc::dropdown.item>');
        $this->assertElement($link, 'a', 'oc-dropdown-item', ['href' => '/profile'], 'Profile');
        $this->assertStringNotContainsString('type=', $link);

        $html = $this->render('<x-oc::dropdown.item wire:click="save" icon="mdi:check" tone="success" description="Second line" hint="Ctrl S">Save</x-oc::dropdown.item>');
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['type' => 'button', 'wire:click' => 'save']);
        $this->assertElement($html, 'span', 'oc-dropdown-icon oc-dropdown-icon--success', ['aria-hidden' => 'true']);
        $this->assertStringContainsString('data-webicon="mdi:check"', $html);
        $this->assertElement($html, 'span', 'oc-dropdown-desc', [], 'Second line');
        $this->assertElement($html, 'span', 'oc-dropdown-hint', [], 'Ctrl S');

        $check = $this->render('<x-oc::dropdown.item :checked="false">Status bar</x-oc::dropdown.item>');
        $this->assertElement($check, 'button', 'oc-dropdown-item', ['role' => 'menuitemcheckbox', 'aria-checked' => 'false']);
        $this->assertElement($check, 'span', 'oc-dropdown-check', ['aria-hidden' => 'true']);
        $radio = $this->render('<x-oc::dropdown.item checked radio>Top</x-oc::dropdown.item>');
        $this->assertElement($radio, 'button', 'oc-dropdown-item', ['role' => 'menuitemradio', 'aria-checked' => 'true']);

        $this->assertElement($this->render('<x-oc::dropdown.item destructive>Delete</x-oc::dropdown.item>'), 'button', 'oc-dropdown-item oc-dropdown-item--destructive', [], 'Delete');
        $this->assertElement($this->render('<x-oc::dropdown.item disabled>Off</x-oc::dropdown.item>'), 'button', 'oc-dropdown-item', ['aria-disabled' => 'true', 'disabled' => null]);
    }

    public function test_dropdown_label_separator_and_sub(): void
    {
        $this->assertSame('<div class="oc-dropdown-label">Account</div>', $this->render('<x-oc::dropdown.label>Account</x-oc::dropdown.label>'));
        $this->assertElement($this->render('<x-oc::dropdown.separator />'), 'div', 'oc-dropdown-separator', ['role' => 'separator']);
        $html = $this->render('<x-oc::dropdown.sub label="More tools"><x-oc::dropdown.item>Developer tools</x-oc::dropdown.item></x-oc::dropdown.sub>');
        $this->assertElement($html, 'div', 'oc-dropdown-sub');
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitem', 'aria-haspopup' => 'menu'], 'More tools');
        $this->assertElement($html, 'div', 'oc-dropdown-submenu', ['role' => 'menu'], 'Developer tools');
    }

    public function test_menubar_item_attributes_and_menu_slot(): void
    {
        $html = $this->render(<<<'BLADE'
<x-oc::menubar id="mb" :menus="[
    ['label' => 'File', 'items' => [['label' => 'New tab', 'shortcut' => 'Ctrl T', 'attributes' => ['wire:click' => 'newTab']], ['label' => 'Plain']]],
    ['label' => 'View', 'slot' => 'view'],
]">
    <x-slot:view><x-oc::dropdown.item :checked="true" wire:click="toggle('bookmarks')">Always show bookmarks</x-oc::dropdown.item></x-slot:view>
</x-oc::menubar>
BLADE);
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['type' => 'button', 'role' => 'menuitem', 'wire:click' => 'newTab'], 'New tab Ctrl T');
        $this->assertStringContainsString('<button class="oc-dropdown-item" type="button" role="menuitem" >Plain</button>', $html);
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => 'mb-2', 'popover' => null], 'Always show bookmarks');
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitemcheckbox', 'aria-checked' => 'true', 'wire:click' => "toggle('bookmarks')"]);
    }

    public function test_accordion_item_script_mode(): void
    {
        $html = $this->render('<x-oc::accordion><x-oc::accordion.item title="One" :expanded="true" :trigger-attributes="[\'wire:click\' => \'toggle(0)\']">A</x-oc::accordion.item><x-oc::accordion.item title="Two" :expanded="false" disabled>B</x-oc::accordion.item></x-oc::accordion>');
        $this->assertStringNotContainsString('<details', $html);
        $this->assertElement($html, 'div', 'oc-accordion-item is-open');
        $this->assertElement($html, 'button', 'oc-accordion-trigger', ['type' => 'button', 'aria-expanded' => 'true', 'wire:click' => 'toggle(0)'], 'One');
        $this->assertElement($html, 'button', 'oc-accordion-trigger', ['disabled' => null], 'Two');
        $this->assertStringContainsString('<div class="oc-accordion-content">A</div>', $html);

        $details = $this->render('<x-oc::accordion.item title="One" open>A</x-oc::accordion.item>');
        $this->assertElement($details, 'details', 'oc-accordion-item', ['name' => 'oc-accordion', 'open' => null]);
    }

    public function test_card_action_text_link_and_grid(): void
    {
        $html = $this->render('<x-oc::card title="Team" text="Two seats left."><x-slot:action><span>3 / 5</span></x-slot:action><x-slot:footer><x-oc::card.link href="/members">Manage members</x-oc::card.link></x-slot:footer></x-oc::card>');
        $this->assertElement($html, 'div', 'oc-card-action', [], '3 / 5');
        $this->assertStringContainsString('<div class="oc-card-content"><p class="oc-card-text">Two seats left.</p></div>', $html);
        $this->assertStringContainsString('<a class="oc-card-link" href="/members">Manage members</a>', $html);

        $header = $this->render('<x-oc::card><x-slot:header><h3 class="oc-card-title">T</h3></x-slot:header><x-slot:action>A</x-slot:action>Body</x-oc::card>');
        $this->assertStringContainsString('<div class="oc-card-header"><h3 class="oc-card-title">T</h3><div class="oc-card-action">A</div></div>', $header);

        $plain = $this->render('<x-oc::card title="T">Body</x-oc::card>');
        $this->assertStringNotContainsString('oc-card-action', $plain);
        $this->assertStringContainsString('<div class="oc-card-content">Body</div>', $plain);

        $grid = $this->render('<x-oc::card.grid bands min="15rem" :gap="1" class="w-full"><x-oc::card>X</x-oc::card></x-oc::card.grid>');
        $this->assertElement($grid, 'div', 'oc-card-grid oc-card-grid--bands w-full', ['style' => '--oc-card-min: 15rem; --oc-card-gap: 1rem']);
        $this->assertSame('<div class="oc-card-grid oc-card-grid--wide"></div>', $this->render('<x-oc::card.grid wide />'));
    }

    public function test_button_group_text_and_item_separator(): void
    {
        $this->assertSame('<span class="oc-btn-group-text">3 items</span>', $this->render('<x-oc::button-group.text>3 items</x-oc::button-group.text>'));
        $this->assertSame('<hr class="oc-item-separator">', $this->render('<x-oc::item.separator />'));
    }

    public function test_date_picker_and_search_use_webicons(): void
    {
        $date = $this->render('<x-oc::date-picker id="when" />');
        $this->assertElement($date, 'svg', 'oc-icon oc-icon--sm', ['data-webicon' => 'mdi:calendar', 'aria-hidden' => 'true']);
        $this->assertStringNotContainsString('M8 3v4', $date);
        $search = $this->render('<x-oc::search placeholder="Search" />');
        $this->assertElement($search, 'svg', 'oc-search-icon', ['data-webicon' => 'mdi:magnify', 'aria-hidden' => 'true']);
    }
}

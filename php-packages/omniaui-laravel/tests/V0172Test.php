<?php

// File: tests/V0172Test.php
// Map: dropdown radio group + radio item -> data table bulk-actions + column width -> app header search collapse CSS

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0172Test extends TestCase
{
    public function test_dropdown_radio_group_with_items(): void
    {
        $html = $this->render('<x-oc::dropdown.radio-group value="date" :items="[[\'value\' => \'name\', \'label\' => \'Name\'], [\'value\' => \'date\', \'label\' => \'Date\', \'icon\' => \'mdi:calendar\']]" />');
        $this->assertElement($html, 'div', 'oc-dropdown-radio-group', ['role' => 'group']);
        $this->assertSame(2, substr_count($html, 'role="menuitemradio"'));
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitemradio', 'aria-checked' => 'false', 'data-value' => 'name']);
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitemradio', 'aria-checked' => 'true', 'data-value' => 'date']);
        $this->assertStringContainsString('oc-dropdown-check', $html);
        $this->assertStringContainsString('oc-dropdown-icon', $html);
        $this->assertStringNotContainsString('wire:click', $html);
    }

    public function test_dropdown_radio_group_livewire_model(): void
    {
        $html = $this->render('<x-oc::dropdown.radio-group model="sort" value="name" :items="[[\'value\' => \'name\', \'label\' => \'Name\']]" />');
        $this->assertStringContainsString("wire:click=\"\$set('sort', 'name')\"", $html);
    }

    public function test_dropdown_radio_item(): void
    {
        $html = $this->render('<x-oc::dropdown.radio-item value="amount" :checked="true" class="extra">Amount</x-oc::dropdown.radio-item>');
        $this->assertElement($html, 'button', 'oc-dropdown-item extra', ['role' => 'menuitemradio', 'aria-checked' => 'true', 'data-value' => 'amount'], 'Amount');

        $off = $this->render('<x-oc::dropdown.radio-item value="name">Name</x-oc::dropdown.radio-item>');
        $this->assertElement($off, 'button', 'oc-dropdown-item', ['role' => 'menuitemradio', 'aria-checked' => 'false']);

        // unchanged: the older dropdown.item radio
        $old = $this->render('<x-oc::dropdown.item radio :checked="true">Old</x-oc::dropdown.item>');
        $this->assertElement($old, 'button', 'oc-dropdown-item', ['role' => 'menuitemradio', 'aria-checked' => 'true']);
    }

    private function bulkKeys(string $html): array
    {
        preg_match('/<div class="oc-data-table-bulk"[^>]*>(.*?)<\/div>/s', $html, $bar);
        preg_match_all('/data-oc-bulk="([^"]+)"/', $bar[1] ?? '', $m);

        return $m[1];
    }

    public function test_data_table_default_bulk_bar(): void
    {
        $html = $this->render('<x-oc::data-table :columns="[[\'key\' => \'name\', \'header\' => \'Name\']]" :rows="[]" />');
        $this->assertSame(['export', 'duplicate', 'archive', 'restore', 'delete', 'clear'], $this->bulkKeys($html));
        $this->assertStringContainsString('class="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete"', $html);
    }

    public function test_data_table_bulk_actions(): void
    {
        $html = $this->render('<x-oc::data-table :columns="[[\'key\' => \'name\', \'header\' => \'Name\']]" :rows="[]" :bulk-actions="$actions" />', ['actions' => [
            ['key' => 'remind', 'label' => 'Send reminder', 'icon' => 'mdi:email-outline', 'tone' => 'primary'],
            ['key' => 'mark', 'label' => 'Mark paid', 'disabled' => true],
            ['key' => 'delete', 'label' => 'Remove', 'tone' => 'ghost'],
            ['key' => 'duplicate', 'hidden' => true],
        ]]);
        $this->assertSame(['export', 'archive', 'restore', 'delete', 'remind', 'mark', 'clear'], $this->bulkKeys($html));
        $this->assertMatchesRegularExpression('/<button class="oc-btn oc-btn--sm" type="button" data-oc-bulk="remind"\s*>(<svg|<iconify-icon)/', $html);
        $this->assertMatchesRegularExpression('/data-oc-bulk="mark"\s+disabled/', $html);
        $this->assertStringContainsString('<button class="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="delete"', $html);
        $this->assertStringContainsString('>Remove</button>', $html);
    }

    public function test_data_table_column_width(): void
    {
        $html = $this->render('<x-oc::data-table :columns="$c" :rows="$r" />', [
            'c' => [
                ['key' => 'name', 'header' => 'Name', 'minWidth' => '12rem', 'truncate' => '10rem'],
                ['key' => 'amount', 'header' => 'Amount', 'width' => '8rem', 'min-width' => '6rem'],
                ['key' => 'code', 'header' => 'Code'],
            ],
            'r' => [['key' => '1', 'cells' => ['name' => 'Company 1', 'amount' => '10', 'code' => 'C1']]],
        ]);
        $this->assertMatchesRegularExpression('/<th data-oc-col="name"[^>]*style="min-width: 12rem;"/', $html);
        $this->assertMatchesRegularExpression('/<th data-oc-col="amount"[^>]*style="width: 8rem; min-width: 6rem;"/', $html);
        $this->assertDoesNotMatchRegularExpression('/<th data-oc-col="code"[^>]*style=/', $html);
        $this->assertStringContainsString('class="oc-data-table-truncate" style="--oc-data-table-truncate: 10rem" title="Company 1"', $html);
    }
    public function test_combobox_ghost_header_trigger(): void
    {
        $opts = ['nl' => ['label' => 'Nederlands', 'icon' => 'mdi:translate'], 'en' => ['label' => 'English', 'emoji' => 'E']];
        $html = $this->render('<x-oc::combobox trigger-variant="ghost" size="header" label="Workspaces" trigger-aria-label="Workspace" :options="$o" value="nl" />', ['o' => $opts]);
        $this->assertElement($html, 'div', 'oc-combobox oc-combobox--ghost oc-combobox--header', ['data-oc-combobox' => null, 'data-oc-portal' => null]);
        $this->assertStringContainsString('aria-label="Workspace"', $html);
        $this->assertStringContainsString('<ul class="oc-combobox-list" id="', $html);

        // portal off on request; full (default) adds no class and no portal
        $this->assertStringNotContainsString('data-oc-portal', $this->render('<x-oc::combobox size="header" :portal="false" :options="$o" />', ['o' => $opts]));
        $plain = $this->render('<x-oc::combobox label="Language" :options="$o" />', ['o' => $opts]);
        $this->assertStringNotContainsString('oc-combobox--', $plain);
        $this->assertStringNotContainsString('data-oc-portal', $plain);
        $this->assertStringContainsString('aria-label="Language"', $plain);
    }

    public function test_combobox_icon_only(): void
    {
        $opts = ['nl' => ['label' => 'Nederlands', 'icon' => 'mdi:translate'], 'en' => ['label' => 'English', 'emoji' => 'E'], 'x' => 'Other'];
        $code = $this->render('<x-oc::combobox size="header" icon-only trigger-label="NL" trigger-aria-label="Language" :options="$o" value="nl" />', ['o' => $opts]);
        $this->assertElement($code, 'div', 'oc-combobox oc-combobox--header oc-combobox--icon-only');
        $this->assertMatchesRegularExpression('/<span class="oc-combobox-icon" aria-hidden="true" data-oc-fixed><span class="oc-combobox-code">NL<\/span><\/span>/', $code);

        $icon = $this->render('<x-oc::combobox size="header" icon-only :options="$o" value="nl" />', ['o' => $opts]);
        $this->assertMatchesRegularExpression('/<span class="oc-combobox-icon" aria-hidden="true">(<svg|<iconify-icon)/', $icon);
        $this->assertStringNotContainsString('data-oc-fixed', $icon);

        $emoji = $this->render('<x-oc::combobox size="header" icon-only :options="$o" value="en" />', ['o' => $opts]);
        $this->assertMatchesRegularExpression('/<span class="oc-combobox-icon" aria-hidden="true"><span class="oc-combobox-option-emoji" aria-hidden="true">E<\/span>/', $emoji);

        $dots = $this->render('<x-oc::combobox size="header" icon-only :options="$o" />', ['o' => $opts]);
        $this->assertStringContainsString('data-webicon="mdi:dots-horizontal"', $dots);

        $notHeader = $this->render('<x-oc::combobox icon-only :options="$o" />', ['o' => $opts]);
        $this->assertStringNotContainsString('oc-combobox--icon-only', $notHeader);
    }
}

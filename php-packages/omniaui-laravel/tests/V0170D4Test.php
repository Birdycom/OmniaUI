<?php

// File: tests/V0170D4Test.php
// Map: sidebar provider (state, persist, storage, breakpoint, shortcut) -> trigger -> rail -> inset -> menu action + item
//      action slot -> data table server mode (total, page, sort, trashed, search, delay) -> loading skeleton -> column chooser
// Package D4 of 0.17.0: Blade renders the same classes and data attributes as the React and Vue components.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170D4Test extends TestCase
{
    private const COLUMNS = "[['key' => 'name', 'header' => 'Name', 'hideable' => false], ['key' => 'sku', 'header' => 'Article ID'], ['key' => 'price', 'header' => 'Price', 'numeric' => true]]";

    private const ROWS = "[['key' => 'a1', 'cells' => ['name' => 'Article 1', 'sku' => 'SKU-1', 'price' => '5,15']], ['key' => 'a2', 'cells' => ['name' => 'Article 2', 'sku' => 'SKU-2', 'price' => '7,00']]]";

    public function test_sidebar_provider_defaults(): void
    {
        $html = $this->render('<x-oc::sidebar.provider>Body</x-oc::sidebar.provider>');
        $this->assertElement($html, 'div', 'oc-sidebar-provider', ['data-oc-sidebar-provider' => '', 'data-state' => 'expanded'], 'Body');
        $this->assertStringNotContainsString('data-oc-persist', $html);
        $this->assertStringNotContainsString('data-oc-storage', $html);
        $this->assertStringNotContainsString('data-oc-shortcut', $html);
    }

    public function test_sidebar_provider_options(): void
    {
        $html = $this->render('<x-oc::sidebar.provider collapsed persist="app" storage="cookie" :mobile-breakpoint="1024" :shortcut="false">x</x-oc::sidebar.provider>');
        $this->assertElement($html, 'div', 'oc-sidebar-provider', [
            'data-state' => 'collapsed',
            'data-oc-persist' => 'app',
            'data-oc-storage' => 'cookie',
            'data-oc-mobile-breakpoint' => '1024',
            'data-oc-shortcut' => '',
        ]);
    }

    public function test_sidebar_trigger_rail_and_inset(): void
    {
        $trigger = $this->render('<x-oc::sidebar.trigger />');
        $this->assertElement($trigger, 'button', 'oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-sidebar-trigger', [
            'type' => 'button', 'aria-label' => 'Toggle sidebar', 'aria-expanded' => 'true', 'data-oc-sidebar-trigger' => null,
        ]);
        $this->assertElement($this->render('<x-oc::sidebar.trigger label="Menu">M</x-oc::sidebar.trigger>'), 'button', 'oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-sidebar-trigger', ['aria-label' => 'Menu'], 'M');
        $this->assertElement($this->render('<x-oc::sidebar.rail />'), 'button', 'oc-sidebar-rail', ['tabindex' => '-1', 'data-oc-sidebar-rail' => null, 'aria-label' => 'Toggle sidebar']);
        $this->assertElement($this->render('<x-oc::sidebar.inset>Page</x-oc::sidebar.inset>'), 'main', 'oc-sidebar-inset', [], 'Page');
        $this->assertElement($this->render('<x-oc::sidebar.inset as="div">Page</x-oc::sidebar.inset>'), 'div', 'oc-sidebar-inset', [], 'Page');
    }

    public function test_sidebar_menu_action_in_an_item(): void
    {
        $html = $this->render('<x-oc::sidebar><x-oc::sidebar.group><x-oc::sidebar.item href="/projects">Projects<x-slot:action><x-oc::sidebar.menu-action label="More" show-on-hover>+</x-oc::sidebar.menu-action></x-slot:action></x-oc::sidebar.item></x-oc::sidebar.group></x-oc::sidebar>');
        $this->assertElement($html, 'button', 'oc-sidebar-menu-action oc-sidebar-menu-action--hover', ['aria-label' => 'More', 'title' => 'More', 'type' => 'button'], '+');
        $this->assertMatchesRegularExpression('#</a>\s*<button [^>]*class="oc-sidebar-menu-action#', $html, 'the action follows the link in the <li>');
        $plain = $this->render('<x-oc::sidebar.menu-action label="Add" />');
        $this->assertElement($plain, 'button', 'oc-sidebar-menu-action', ['aria-label' => 'Add']);
    }

    public function test_a_provider_wraps_a_sidebar_rail_and_inset(): void
    {
        $html = $this->render('<x-oc::sidebar.provider persist="app"><x-oc::sidebar><x-oc::sidebar.group label="Main"><x-oc::sidebar.item href="/">Home</x-oc::sidebar.item></x-oc::sidebar.group></x-oc::sidebar><x-oc::sidebar.rail /><x-oc::sidebar.inset><x-oc::sidebar.trigger />Content</x-oc::sidebar.inset></x-oc::sidebar.provider>');
        $this->assertMatchesRegularExpression('#<div [^>]*class="oc-sidebar-provider"[^>]*>\s*<aside [^>]*class="oc-sidebar"#', $html);
        $this->assertMatchesRegularExpression('#</aside>\s*<button [^>]*class="oc-sidebar-rail"#', $html);
        $this->assertStringContainsString('data-oc-sidebar-trigger', $html);
    }

    public function test_data_table_server_mode_attributes(): void
    {
        $html = $this->render('<x-oc::data-table table-id="dt" server :total="42" :page="3" :sort="[\'key\' => \'price\', \'dir\' => \'desc\']" trashed="deleted" search="hinge" :search-delay="500" :columns="'.self::COLUMNS.'" :rows="'.self::ROWS.'" />');
        $this->assertElement($html, 'div', 'oc-data-table', ['id' => 'dt', 'data-oc-server' => 'true', 'data-oc-total' => '42', 'data-oc-current-page' => '3', 'data-oc-search-delay' => '500']);
        $this->assertElement($html, 'th', '', ['data-oc-col' => 'price', 'aria-sort' => 'descending']);
        $this->assertDoesNotMatchRegularExpression('#data-oc-col="name"[^>]*aria-sort#', $html);
        $this->assertElement($html, 'button', 'oc-filter-pill', ['data-oc-filter' => 'deleted', 'aria-current' => 'true']);
        $this->assertDoesNotMatchRegularExpression('#data-oc-filter="active" aria-current#', $html);
        $this->assertElement($html, 'input', 'oc-input oc-data-table-search', ['value' => 'hinge']);
        $this->assertStringContainsString('Article 2', $html);
    }

    public function test_data_table_without_server_keeps_the_old_markup(): void
    {
        $html = $this->render('<x-oc::data-table :columns="'.self::COLUMNS.'" :rows="'.self::ROWS.'" />');
        $this->assertStringNotContainsString('data-oc-server', $html);
        $this->assertStringNotContainsString('aria-busy', $html);
        $this->assertStringNotContainsString('oc-data-table-colpick', $html);
        $this->assertElement($html, 'button', 'oc-filter-pill', ['data-oc-filter' => 'active', 'aria-current' => 'true']);
        $sort = $this->render('<x-oc::data-table :columns="[[\'key\' => \'name\', \'header\' => \'Name\', \'defaultSort\' => \'ascending\']]" :rows="[]" />');
        $this->assertElement($sort, 'th', '', ['data-oc-col' => 'name', 'aria-sort' => 'ascending']);
    }

    public function test_data_table_sort_as_a_key(): void
    {
        $html = $this->render('<x-oc::data-table sort="sku" :columns="'.self::COLUMNS.'" :rows="'.self::ROWS.'" />');
        $this->assertElement($html, 'th', '', ['data-oc-col' => 'sku', 'aria-sort' => 'ascending']);
    }

    public function test_data_table_loading_shows_skeleton_rows(): void
    {
        $html = $this->render('<x-oc::data-table server loading :page-size="4" :columns="'.self::COLUMNS.'" :rows="'.self::ROWS.'" />');
        $this->assertElement($html, 'div', 'oc-data-table', ['aria-busy' => 'true']);
        $this->assertSame(4, substr_count($html, 'class="oc-data-table-skeleton"'));
        $this->assertSame(3, substr_count($html, 'oc-data-table-skeleton-bar') / 4, 'one bar per data column');
        $this->assertStringNotContainsString('Article 1', $html, 'the rows wait for the new page');
        $this->assertStringNotContainsString('data-oc-row', $html);
        $few = $this->render('<x-oc::data-table loading :skeleton-rows="2" :columns="'.self::COLUMNS.'" :rows="[]" />');
        $this->assertSame(2, substr_count($few, 'class="oc-data-table-skeleton"'));
    }

    public function test_data_table_column_chooser(): void
    {
        $html = $this->render('<x-oc::data-table table-id="dt" :visible-columns="[\'price\']" :columns="'.self::COLUMNS.'" :rows="'.self::ROWS.'" />');
        $this->assertElement($html, 'div', 'oc-dropdown-menu oc-data-table-colpick', ['id' => 'dt-colpick', 'popover' => null]);
        $this->assertElement($html, 'button', 'oc-btn oc-btn--plain oc-data-table-columns-btn', ['popovertarget' => 'dt-colpick']);
        $this->assertMatchesRegularExpression('#data-oc-visible-col="name" checked disabled#', $html, 'a column that cannot hide stays checked');
        $this->assertMatchesRegularExpression('#data-oc-visible-col="sku"\s*>#', $html, 'a hidden column is unchecked');
        $this->assertMatchesRegularExpression('#data-oc-visible-col="price" checked\s*>#', $html);
        $this->assertStringNotContainsString('SKU-1', $html, 'a hidden column is not rendered');
        $this->assertStringContainsString('Article 1', $html);
        $this->assertStringNotContainsString('data-oc-col="sku"', $html);
    }
}

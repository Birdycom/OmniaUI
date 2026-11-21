<?php

// File: tests/V0170R4Test.php
// Map: 0.17.0 round 4: data table column hideBelow / hide-below -> data-hide-below on th, tds and skeleton tds
//      -> invalid values ignored -> the static data table block hides e-mail (lg) and status (sm)

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170R4Test extends TestCase
{
    private function table(array $extra = []): string
    {
        return $this->render('<x-oc::data-table table-id="dt-hide" :columns="$columns" :rows="$rows" :loading="$loading" :skeleton-rows="2" />', [
            'columns' => [
                ['key' => 'name', 'header' => 'Name'],
                ['key' => 'email', 'header' => 'E-mail', 'hideBelow' => 'lg'],
                ['key' => 'status', 'header' => 'Status', 'hide-below' => 'sm'],
                ['key' => 'note', 'header' => 'Note', 'hideBelow' => 'xl'],
            ],
            'rows' => [
                ['key' => 'c1', 'cells' => ['name' => 'Contact 1', 'email' => 'info@contact1.example', 'status' => 'Active', 'note' => '-']],
                ['key' => 'c2', 'cells' => ['name' => 'Contact 2', 'email' => 'info@contact2.example', 'status' => 'Pending', 'note' => '-']],
            ],
            'loading' => false,
            ...$extra,
        ]);
    }

    public function test_hide_below_on_header_and_cells(): void
    {
        $html = $this->table();

        $this->assertMatchesRegularExpression('/<th data-oc-col="email"[^>]*data-hide-below="lg"/', $html);
        $this->assertMatchesRegularExpression('/<th data-oc-col="status"[^>]*data-hide-below="sm"/', $html);
        $this->assertSame(2, preg_match_all('/<td data-oc-col="email"[^>]*data-hide-below="lg"/', $html));
        $this->assertSame(2, preg_match_all('/<td data-oc-col="status"[^>]*data-hide-below="sm"/', $html));
        $this->assertDoesNotMatchRegularExpression('/data-oc-col="name"[^>]*data-hide-below/', $html);
    }

    public function test_unknown_breakpoint_is_ignored(): void
    {
        $this->assertDoesNotMatchRegularExpression('/data-oc-col="note"[^>]*data-hide-below/', $this->table());
        $this->assertStringNotContainsString('data-hide-below="xl"', $this->table());
    }

    public function test_skeleton_cells_keep_the_switch(): void
    {
        $html = $this->table(['loading' => true]);

        $this->assertSame(2, preg_match_all('/<td\s+data-hide-below="lg"\s*><span class="oc-skeleton/', $html));
        $this->assertSame(2, preg_match_all('/<td\s+data-hide-below="sm"\s*><span class="oc-skeleton/', $html));
    }

    public function test_data_table_block_hides_email_and_status(): void
    {
        $html = $this->render('<x-oc::block.data-table />');

        $this->assertMatchesRegularExpression('/<th data-oc-col="email" data-hide-below="lg"/', $html);
        $this->assertMatchesRegularExpression('/<th data-oc-col="status" data-hide-below="sm"/', $html);
        $this->assertSame(substr_count($html, 'data-oc-col="email"'), substr_count($html, 'data-oc-col="email" data-hide-below="lg"'));
        $this->assertSame(substr_count($html, 'data-oc-col="status"'), substr_count($html, 'data-oc-col="status" data-hide-below="sm"'));
    }
}

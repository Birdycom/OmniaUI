<?php

// File: tests/V0180WrappersTest.php
// Map: meter-list (variants + live) -> stat-card-grid -> form-group (legacy)
// Blade wrappers of 0.18.0 for markup that was a plain div before.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180WrappersTest extends TestCase
{
    public function test_meter_list_renders_rows_and_extra_classes(): void
    {
        $html = $this->render('<x-oc::meter-list class="mt-2"><x-oc::meter-row label="Session" :percent="40" /><x-oc::meter-row label="Week" :percent="80" /></x-oc::meter-list>');
        $this->assertElement($html, 'div', 'oc-meter-list mt-2');
        $this->assertSame(2, substr_count($html, 'class="oc-meter-row"'));
    }

    public function test_meter_list_variants(): void
    {
        foreach (['compact', 'dense', 'live'] as $variant) {
            $html = $this->render('<x-oc::meter-list variant="'.$variant.'">x</x-oc::meter-list>');
            $this->assertElement($html, 'div', 'oc-meter-list oc-meter-list--'.$variant);
        }
    }

    public function test_meter_list_live_combines_without_doubling(): void
    {
        $this->assertElement($this->render('<x-oc::meter-list variant="dense" live>x</x-oc::meter-list>'), 'div', 'oc-meter-list oc-meter-list--dense oc-meter-list--live');
        $this->assertSame(1, substr_count($this->render('<x-oc::meter-list variant="live" live>x</x-oc::meter-list>'), 'oc-meter-list--live'));
        $this->assertElement($this->render('<x-oc::meter-list live>x</x-oc::meter-list>'), 'div', 'oc-meter-list oc-meter-list--live');
        $this->assertElement($this->render('<x-oc::meter-list>x</x-oc::meter-list>'), 'div', 'oc-meter-list');
    }

    public function test_stat_card_grid_wraps_cards(): void
    {
        $html = $this->render('<x-oc::stat-card-grid class="mb-4"><x-oc::stat-card value="12" label="Open invoices" /></x-oc::stat-card-grid>');
        $this->assertElement($html, 'div', 'oc-stat-card-grid mb-4');
        $this->assertStringContainsString('oc-stat-card', $html);
        $this->assertStringContainsString('Open invoices', $html);
    }

    public function test_form_group_wraps_its_slot(): void
    {
        $html = $this->render('<x-oc::form-group id="g1"><label class="oc-label" for="name">Name</label><input id="name" class="oc-input"></x-oc::form-group>');
        $this->assertElement($html, 'div', 'oc-form-group', ['id' => 'g1']);
        $this->assertStringContainsString('<input id="name" class="oc-input">', $html);
    }
}

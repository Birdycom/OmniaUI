<?php

// File: tests/V0170GlassTest.php
// Map: glass bar ['sep' => true] -> divider between two groups, the items stay links -> lens prop (off = data-oc-glass-lens)
//      -> draggable prop (data-oc-glass-drag, never the native draggable attribute)

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170GlassTest extends TestCase
{
    public function test_glass_bar_separator(): void
    {
        $items = [['label' => 'Draw', 'href' => '#d', 'current' => true], ['label' => 'Text', 'href' => '#t'], ['sep' => true], ['label' => 'Share', 'href' => '#s']];
        $bar = $this->render('<x-oc::glass-bar icons label="Tools" :items="$items" />', ['items' => $items]);

        $this->assertStringContainsString('class="oc-glass-bar oc-glass-bar--icons" aria-label="Tools"', $bar);
        $this->assertSame(1, substr_count($bar, '<span class="oc-glass-bar__sep" aria-hidden="true"></span>'));
        $this->assertSame(3, substr_count($bar, 'class="oc-glass-bar__item"'));
        $this->assertGreaterThan(strpos($bar, 'aria-label="Text"'), strpos($bar, 'oc-glass-bar__sep'));
        $this->assertLessThan(strpos($bar, 'aria-label="Share"'), strpos($bar, 'oc-glass-bar__sep'));
    }

    public function test_glass_lens_prop(): void
    {
        $on = $this->render('<x-oc::glass class="p-1">Body</x-oc::glass>');
        $this->assertStringContainsString('<div class="oc-glass p-1">Body</div>', $on);
        $this->assertStringNotContainsString('data-oc-glass-lens', $on);

        $off = $this->render('<x-oc::glass :lens="false">Body</x-oc::glass>');
        $this->assertStringContainsString('<div data-oc-glass-lens="off" class="oc-glass">Body</div>', $off);

        $bar = $this->render('<x-oc::glass-bar :lens="false" :items="[]" />');
        $this->assertStringContainsString('data-oc-glass-lens="off"', $bar);
    }

    public function test_glass_draggable_prop(): void
    {
        $drag = $this->render('<x-oc::glass draggable class="p-1">Body</x-oc::glass>');
        $this->assertStringContainsString('<div data-oc-glass-drag="" class="oc-glass p-1">Body</div>', $drag);
        $this->assertStringNotContainsString('draggable', str_replace('data-oc-glass-drag', '', $drag));

        $both = $this->render('<x-oc::glass :draggable="true" :lens="false">Body</x-oc::glass>');
        $this->assertStringContainsString('data-oc-glass-lens="off"', $both);
        $this->assertStringContainsString('data-oc-glass-drag=""', $both);

        $off = $this->render('<x-oc::glass>Body</x-oc::glass>');
        $this->assertStringNotContainsString('data-oc-glass-drag', $off);
    }
}

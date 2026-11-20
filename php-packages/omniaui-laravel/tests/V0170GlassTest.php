<?php

// File: tests/V0170GlassTest.php
// Map: glass bar ['sep' => true] -> divider between two groups, the items stay links

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
}

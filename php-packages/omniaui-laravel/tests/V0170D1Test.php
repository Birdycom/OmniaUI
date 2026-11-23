<?php

// File: tests/V0170D1Test.php
// Map: module prop -> data-module (badge, button, launcher card, form section, module header block) -> badge variant module ->
//      button float (particles, data-float-icon, mask of another webicon) -> module header eyebrow + fixed-height

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170D1Test extends TestCase
{
    public function test_module_sets_data_module_on_the_root(): void
    {
        $this->assertElement($this->render('<x-oc::badge module="green">Paid</x-oc::badge>'), 'span', 'oc-badge', ['data-module' => 'green'], 'Paid');
        $this->assertElement($this->render('<x-oc::button module="blue">Save</x-oc::button>'), 'button', 'oc-btn', ['data-module' => 'blue', 'type' => 'button'], 'Save');
        $this->assertElement($this->render('<x-oc::button module="red" href="/x">Open</x-oc::button>'), 'a', 'oc-btn', ['data-module' => 'red', 'href' => '/x'], 'Open');
        $this->assertElement($this->render('<x-oc::launcher-card module="purple" href="/contacts" title="Contacts" />'), 'a', 'oc-launcher', ['data-module' => 'purple', 'href' => '/contacts']);
        $this->assertElement($this->render('<x-oc::form-section module="teal" title="Address">x</x-oc::form-section>'), 'details', 'oc-form-section', ['data-module' => 'teal']);
        $this->assertElement($this->render('<x-oc::block.module-header module="orange" />'), 'header', 'oc-block-modulehead', ['data-module' => 'orange']);
    }

    public function test_without_module_nothing_changes(): void
    {
        $this->assertSame('<span class="oc-badge">New</span>', $this->render('<x-oc::badge>New</x-oc::badge>'));
        $this->assertSame('<button type="button" class="oc-btn" >Save</button>', $this->render('<x-oc::button>Save</x-oc::button>'));
        foreach (['<x-oc::launcher-card href="/a" title="A" />', '<x-oc::form-section title="B">x</x-oc::form-section>', '<x-oc::block.module-header />'] as $blade) {
            $html = $this->render($blade);
            $this->assertStringNotContainsString('data-module', $html);
            $this->assertStringNotContainsString('oc-block-modulehead-eyebrow', $html);
            $this->assertStringNotContainsString('--fixed', $html);
        }
    }

    public function test_badge_variant_module(): void
    {
        $this->assertElement($this->render('<x-oc::badge variant="module">Sales</x-oc::badge>'), 'span', 'oc-badge oc-badge--module', [], 'Sales');
    }

    public function test_button_float(): void
    {
        $hearts = $this->render('<x-oc::button float="hearts" module="pink">Donate</x-oc::button>');
        $this->assertElement($hearts, 'button', 'oc-btn oc-btn--float', ['data-float-icon' => 'mdi:heart', 'data-module' => 'pink']);
        $this->assertElement($hearts, 'span', 'oc-btn-float', ['aria-hidden' => 'true']);
        $this->assertSame(5, substr_count($hearts, '<i></i>'));
        $this->assertStringNotContainsString('style=', $hearts);
        $this->assertLessThan(strpos($hearts, 'Donate'), strpos($hearts, 'oc-btn-float"'));

        $bare = $this->render('<x-oc::button float>Give</x-oc::button>');
        $this->assertElement($bare, 'button', 'oc-btn oc-btn--float', ['data-float-icon' => 'mdi:heart']);

        $star = $this->render('<x-oc::button float="mdi:star" href="/star">Star</x-oc::button>');
        $this->assertElement($star, 'a', 'oc-btn oc-btn--float', ['data-float-icon' => 'mdi:star', 'href' => '/star']);
        $this->assertStringNotContainsString('style=', $star);

        // Another webicon that the app has: its SVG becomes the mask (data URI); an unknown name falls back on the heart.
        $other = $this->render('<x-oc::button float="mdi:check">Done</x-oc::button>');
        if (\Omniacss\Laravel\Webicons::get('mdi:check')) {
            $this->assertStringContainsString('style="--oc-btn-float-icon: url(&quot;data:image/svg+xml,%3Csvg', $other);
        }
        $unknown = $this->render('<x-oc::button float="mdi:no-such-icon-d1">Done</x-oc::button>');
        $this->assertElement($unknown, 'button', 'oc-btn oc-btn--float', ['data-float-icon' => 'mdi:no-such-icon-d1']);
        $this->assertStringNotContainsString('style=', $unknown);
    }

    public function test_module_header_eyebrow_and_fixed_height(): void
    {
        $html = $this->render('<x-oc::block.module-header eyebrow="Sales" fixed-height module="blue"><x-slot:title>Invoices</x-slot:title></x-oc::block.module-header>');
        $this->assertElement($html, 'header', 'oc-block-modulehead oc-block-modulehead--fixed', ['data-module' => 'blue']);
        $this->assertElement($html, 'p', 'oc-block-modulehead-eyebrow', [], 'Sales');
        $this->assertLessThan(strpos($html, 'oc-block-modulehead-title'), strpos($html, 'oc-block-modulehead-eyebrow'));

        $slot = $this->render('<x-oc::block.module-header><x-slot:eyebrow>Finance</x-slot:eyebrow></x-oc::block.module-header>');
        $this->assertElement($slot, 'p', 'oc-block-modulehead-eyebrow', [], 'Finance');
    }
}

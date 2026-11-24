<?php

// File: tests/V0180OverlaysTest.php
// Map: combobox portal (data-oc-portal, top layer by the script) -> popover content match-trigger-width -> tooltip as ->
//      dropdown side / align (popover and toggle mode)

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180OverlaysTest extends TestCase
{
    public function test_combobox_portal_keeps_the_list_in_the_wrapper_for_the_script(): void
    {
        $html = $this->render('<x-oc::combobox name="customer" label="Customer" portal :options="[[\'value\' => 1, \'label\' => \'Customer 1\']]" />');
        $this->assertStringContainsString('data-oc-portal', $html);
        // the list is rendered inside .oc-combobox; combobox.js shows it in the top layer (popover="manual")
        $this->assertMatchesRegularExpression('/<div[^>]*class="oc-combobox[^"]*"[^>]*data-oc-portal[^>]*>.*class="oc-combobox-list/s', $html);
        $this->assertStringNotContainsString('popover=', $html);
    }

    public function test_popover_content_match_trigger_width(): void
    {
        $html = $this->render('<x-oc::popover id="p1"><x-oc::popover.trigger>Customer</x-oc::popover.trigger><x-oc::popover.content match-trigger-width title="Customer 1">Details</x-oc::popover.content></x-oc::popover>');
        $this->assertElement($html, 'div', 'oc-popover', ['id' => 'p1', 'data-match-width' => null, 'data-side' => 'bottom', 'popover' => null]);

        $plain = $this->render('<x-oc::popover id="p2"><x-oc::popover.trigger>Customer</x-oc::popover.trigger><x-oc::popover.content>Details</x-oc::popover.content></x-oc::popover>');
        $this->assertStringNotContainsString('data-match-width', $plain);
    }

    public function test_tooltip_as_renders_the_element_itself(): void
    {
        $html = $this->render('<x-oc::tooltip as="button" type="button" class="oc-btn oc-btn--ghost" text="Save" side="bottom">S</x-oc::tooltip>');
        $this->assertElement($html, 'button', 'oc-tooltip oc-tooltip--bottom oc-btn oc-btn--ghost', ['type' => 'button', 'data-tooltip' => 'Save'], 'S');
        $this->assertStringNotContainsString('<span', $html);

        $link = $this->render('<x-oc::tooltip as="a" href="#c" heading="customer" text="Customer 1">Open</x-oc::tooltip>');
        $this->assertElement($link, 'a', 'oc-tooltip', ['href' => '#c']);
        $this->assertStringContainsString('<span class="oc-tooltip__content" role="tooltip">', $link);
        $this->assertStringEndsWith('</a>', trim($link));

        // unknown tags fall back to span; the default stays a span
        $this->assertElement($this->render('<x-oc::tooltip as="script" text="x">y</x-oc::tooltip>'), 'span', 'oc-tooltip', ['data-tooltip' => 'x']);
        $this->assertElement($this->render('<x-oc::tooltip text="x">y</x-oc::tooltip>'), 'span', 'oc-tooltip', ['data-tooltip' => 'x']);
    }

    public function test_dropdown_side_and_align(): void
    {
        $html = $this->render('<x-oc::dropdown id="m1" label="Actions" side="top" align="end"><x-oc::dropdown.item>Edit</x-oc::dropdown.item></x-oc::dropdown>');
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => 'm1', 'data-side' => 'top', 'data-align' => 'end', 'popover' => null]);

        $align = $this->render('<x-oc::dropdown id="m2" align="center" />');
        $this->assertElement($align, 'div', 'oc-dropdown-menu', ['data-side' => 'bottom', 'data-align' => 'center']);

        $toggle = $this->render('<x-oc::dropdown id="m3" mode="toggle" side="right" />');
        $this->assertElement($toggle, 'div', 'oc-dropdown-menu', ['id' => 'm3', 'data-side' => 'right', 'data-align' => 'start']);

        $plain = $this->render('<x-oc::dropdown id="m4" />');
        $this->assertStringNotContainsString('data-side', $plain);
    }
}

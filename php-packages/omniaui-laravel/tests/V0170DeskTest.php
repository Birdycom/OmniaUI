<?php

// File: tests/V0170DeskTest.php
// Map: back link fallback-href/fallback-label (data-oc-back for oc-back-link.js) -> badge icon + title -> button icon-start/
//      icon-end + as -> radio error message -> form section dense -> launcher card disabled-footer

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170DeskTest extends TestCase
{
    public function test_back_link_fallback(): void
    {
        $plain = $this->render('<x-oc::back-link href="/products">Back to Products</x-oc::back-link>');
        $this->assertSame('<a href="/products" class="oc-back-link">Back to Products</a>', $plain);

        $smart = $this->render('<x-oc::back-link fallback-href="/products" fallback-label="Back to Products">Back</x-oc::back-link>');
        $this->assertElement($smart, 'a', 'oc-back-link', ['href' => '/products', 'data-oc-back' => '', 'data-oc-fallback-label' => 'Back to Products'], 'Back');

        $noLabel = $this->render('<x-oc::back-link fallback-href="/products">Back</x-oc::back-link>');
        $this->assertStringNotContainsString('data-oc-fallback-label', $noLabel);
        $this->assertStringContainsString('data-oc-back', $noLabel);
    }

    public function test_badge_icon_and_title(): void
    {
        $plain = $this->render('<x-oc::badge>New</x-oc::badge>');
        $this->assertSame('<span class="oc-badge">New</span>', $plain);

        $badge = $this->render('<x-oc::badge variant="success" icon="mdi:check" title="Paid on 1 March">Paid</x-oc::badge>');
        $this->assertElement($badge, 'span', 'oc-badge oc-badge--success', ['title' => 'Paid on 1 March'], 'Paid');
        $this->assertStringContainsString('mdi:check', $badge);
        $this->assertStringNotContainsString('role="img"', $badge);

        $iconOnly = $this->render('<x-oc::badge icon="mdi:check" title="Verified" />');
        $this->assertElement($iconOnly, 'span', 'oc-badge', ['role' => 'img', 'aria-label' => 'Verified', 'title' => 'Verified']);
    }

    public function test_button_icons_and_as(): void
    {
        $square = $this->render('<x-oc::button icon aria-label="Add">+</x-oc::button>');
        $this->assertElement($square, 'button', 'oc-btn oc-btn--icon', ['type' => 'button', 'aria-label' => 'Add'], '+');

        $icons = $this->render('<x-oc::button variant="outline" icon-start="mdi:plus" icon-end="mdi:check">New customer</x-oc::button>');
        $this->assertElement($icons, 'button', 'oc-btn oc-btn--outline', [], 'New customer');
        $this->assertLessThan(strpos($icons, 'New customer'), strpos($icons, 'mdi:plus'));
        $this->assertGreaterThan(strpos($icons, 'New customer'), strpos($icons, 'mdi:check'));

        $link = $this->render('<x-oc::button as="a" href="/customers" variant="secondary">Customers</x-oc::button>');
        $this->assertElement($link, 'a', 'oc-btn oc-btn--secondary', ['href' => '/customers'], 'Customers');
        $this->assertStringNotContainsString('type=', $link);

        $span = $this->render('<x-oc::button as="span" loading>Saving</x-oc::button>');
        $this->assertElement($span, 'span', 'oc-btn', ['aria-busy' => 'true', 'aria-disabled' => 'true'], 'Saving');

        $href = $this->render('<x-oc::button href="/x">Go</x-oc::button>');
        $this->assertSame('<a href="/x" class="oc-btn">Go</a>', $href);
    }

    public function test_radio_error_message(): void
    {
        $html = $this->render('<x-oc::radio name="plan" legend="Plan" :options="[\'a\' => \'Basic\', \'b\' => \'Team\']" error="Choose a plan" />');
        $this->assertElement($html, 'p', 'oc-field-error', ['id' => 'plan-error', 'role' => 'alert'], 'Choose a plan');
        $this->assertSame(2, substr_count($html, 'aria-invalid="true" aria-describedby="plan-error"'));

        $bool = $this->render('<x-oc::radio name="plan" :options="[\'a\' => \'Basic\']" :error="true" />');
        $this->assertStringContainsString('aria-invalid="true"', $bool);
        $this->assertStringNotContainsString('oc-field-error', $bool);
        $this->assertStringNotContainsString('aria-describedby', $bool);
    }

    public function test_form_section_dense(): void
    {
        $html = $this->render('<x-oc::form-section title="Address" dense open>Fields</x-oc::form-section>');
        $this->assertElement($html, 'details', 'oc-form-section oc-form-section--dense', ['open' => null]);

        $plain = $this->render('<x-oc::form-section title="Address">Fields</x-oc::form-section>');
        $this->assertElement($plain, 'details', 'oc-form-section');
        $this->assertStringNotContainsString('--dense', $plain);
    }

    public function test_launcher_card_disabled_footer(): void
    {
        $off = $this->render('<x-oc::launcher-card title="Invoices" disabled disabled-footer="Ask your admin for access"><x-slot:footer>12 open</x-slot:footer></x-oc::launcher-card>');
        $this->assertElement($off, 'span', 'oc-launcher-footer', [], 'Ask your admin for access');
        $this->assertStringNotContainsString('12 open', $off);

        $on = $this->render('<x-oc::launcher-card title="Invoices" href="/invoices" disabled-footer="Ask your admin for access"><x-slot:footer>12 open</x-slot:footer></x-oc::launcher-card>');
        $this->assertElement($on, 'span', 'oc-launcher-footer', [], '12 open');

        $slot = $this->render('<x-oc::launcher-card title="Invoices" disabled><x-slot:disabled-footer>Not in your plan</x-slot:disabled-footer></x-oc::launcher-card>');
        $this->assertElement($slot, 'span', 'oc-launcher-footer', [], 'Not in your plan');
    }
}

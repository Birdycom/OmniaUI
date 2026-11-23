<?php

// File: tests/V0170AppTest.php
// Map: 0.17.0 app-migration fixes: barcode bare + digit groups switch -> copy field masked / wrap / copiedLabel /
//      ariaLabel / icons + script -> recovery codes icons, copied feedback, print + script

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170AppTest extends TestCase
{
    public function test_barcode_bare_variant_and_group_switch(): void
    {
        $html = $this->render('<x-oc::barcode value="5400000000010" variant="bare" />');
        $this->assertElement($html, 'figure', 'oc-barcode oc-barcode--bare', ['data-value' => '5400000000010']);
        $this->assertStringNotContainsString('data-group', $html);

        $flat = $this->render('<x-oc::barcode value="96385074" :group-digits="false" />');
        $this->assertElement($flat, 'figure', 'oc-barcode', ['data-group' => 'false']);

        // the default keeps the plate and the class list
        $this->assertStringContainsString('class="oc-barcode oc-barcode--hero" data-value="5400000000010"', $this->render('<x-oc::barcode value="5400000000010" size="hero" />'));
    }

    public function test_copy_field_masked_toggle_and_icons(): void
    {
        $html = $this->render('<x-oc::copy-field value="sk_test_123" masked aria-label="API key" reveal-label="Show key" copied-label="Gekopieerd" />');
        $this->assertElement($html, 'input', 'oc-copy-field-value', ['type' => 'password', 'aria-label' => 'API key', 'readonly' => null]);
        $this->assertElement($html, 'button', 'oc-copy-field-toggle', ['aria-pressed' => 'false', 'aria-label' => 'Show key', 'aria-controls' => null]);
        $this->assertElement($html, 'svg', 'oc-copy-field-icon-show', ['data-webicon' => 'mdi:eye']);
        $this->assertElement($html, 'svg', 'oc-copy-field-icon-hide', ['data-webicon' => 'mdi:eye-off']);
        $this->assertElement($html, 'button', 'oc-copy-field-button', ['data-copied-label' => 'Gekopieerd']);
        $this->assertElement($html, 'svg', 'oc-copy-field-icon-copy', ['data-webicon' => 'mdi:content-copy']);
        $this->assertElement($html, 'span', 'oc-copy-field-button-label', [], 'Copy');
        $this->assertElement($html, 'span', 'oc-copy-field-status oc-visually-hidden', ['role' => 'status', 'aria-live' => 'polite']);
        // the script flips the type and swaps the label after copying
        $this->assertStringContainsString("input.type = show ? 'text' : 'password'", $html);
        $this->assertStringContainsString('btn.dataset.copiedLabel', $html);
        // toggle and value are wired by id
        preg_match('/aria-controls="([^"]+)"/', $html, $m);
        $this->assertStringContainsString('id="'.$m[1].'"', $html);
    }

    public function test_copy_field_wrap_default_label_and_no_icon(): void
    {
        $html = $this->render('<x-oc::copy-field value="https://company1.example/a/long/path" wrap :icon="false" />');
        $this->assertElement($html, 'div', 'oc-copy-field oc-copy-field--wrap');
        $this->assertElement($html, 'output', 'oc-copy-field-value', ['aria-label' => 'Value'], 'https://company1.example/a/long/path');
        $this->assertStringNotContainsString('oc-copy-field-icon-copy', $html);
        $this->assertStringNotContainsString('oc-copy-field-toggle"', $html);

        // the 0.17.0 display mode keeps working
        $display = $this->render('<x-oc::copy-field display="lg" :group="4" value="K7QM2XPA" label="Join code" />');
        $this->assertElement($display, 'input', 'oc-copy-field-value', ['value' => 'K7QM 2XPA', 'aria-label' => 'Join code', 'type' => 'text']);
        $this->assertElement($display, 'button', 'oc-copy-field-button', ['data-copy' => 'K7QM2XPA']);
    }

    public function test_recovery_codes_icons_feedback_and_print(): void
    {
        $html = $this->render('<x-oc::recovery-codes :codes="[\'AAAA-1111\', \'BBBB-2222\']" print copied-label="Gekopieerd" />');
        $this->assertStringContainsString('data-webicon="mdi:alert-outline"', $html);
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline oc-btn--sm', ['data-oc-recovery' => 'copy', 'data-copied-label' => 'Gekopieerd']);
        $this->assertElement($html, 'svg', 'oc-recovery-codes-icon-copy', ['data-webicon' => 'mdi:content-copy']);
        $this->assertElement($html, 'svg', 'oc-recovery-codes-icon-copied', ['data-webicon' => 'mdi:check']);
        $this->assertStringContainsString('data-webicon="mdi:download"', $html);
        $this->assertStringContainsString('data-webicon="mdi:printer"', $html);
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline oc-btn--sm', ['data-oc-recovery' => 'print'], 'Print');
        $this->assertElement($html, 'span', 'oc-recovery-codes-status oc-visually-hidden', ['role' => 'status', 'aria-live' => 'polite']);
        $this->assertStringContainsString("action === 'print'", $html);

        $plain = $this->render('<x-oc::recovery-codes :codes="[\'AAAA-1111\']" :icons="false" />');
        $this->assertStringNotContainsString('<svg', $plain);
        $this->assertStringNotContainsString('data-oc-recovery="print"', $plain);
    }
}

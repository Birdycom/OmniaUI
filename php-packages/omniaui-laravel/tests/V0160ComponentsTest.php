<?php

// File: tests/V0160ComponentsTest.php
// Map: combobox with icons -> dropdown item icon -> language menu -> sheet options -> plain collapsible -> live frame
//      (inert, device) -> logo -> mode badge -> code plate -> card accent + band -> sidebar meta
// Components and options of 0.16.0: Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0160ComponentsTest extends TestCase
{
    public function test_combobox_with_icons(): void
    {
        $html = $this->render('<x-oc::combobox name="payment" label="Payment method" value="card" :options="[\'transfer\' => [\'label\' => \'Bank transfer\', \'icon\' => \'mdi:bank-outline\'], \'card\' => [\'label\' => \'Credit card\', \'icon\' => \'mdi:credit-card-outline\'], \'other\' => \'Other\']" />');

        $this->assertStringContainsString('data-oc-combobox', $html);
        $this->assertStringContainsString('<iconify-icon icon="mdi:credit-card-outline"', $html);
        $this->assertElement($html, 'span', 'oc-combobox-icon', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'input', 'oc-input oc-combobox-input', ['role' => 'combobox', 'aria-label' => 'Payment method', 'value' => 'Credit card']);
        $this->assertStringContainsString('<input type="hidden" name="payment" value="card">', $html);
        $this->assertElement($html, 'li', 'oc-combobox-option', ['data-value' => 'card', 'aria-selected' => 'true']);
        $this->assertElement($html, 'li', 'oc-combobox-option', ['data-value' => 'other', 'aria-selected' => 'false'], 'Other');
        $this->assertSame(2, substr_count($html, 'oc-combobox-option-icon'));
    }

    public function test_dropdown_item_icon(): void
    {
        $html = $this->render('<x-oc::dropdown label="Actions" :items="[[\'label\' => \'Edit\', \'href\' => \'/e\', \'icon\' => \'mdi:pencil-outline\'], [\'label\' => \'Paid\', \'href\' => \'/p\']]" />');

        $this->assertSame(1, substr_count($html, 'oc-dropdown-icon'));
        // 0.17.1: mdi:pencil-outline is a built-in webicon (status badge "draft"), so it is inline SVG now
        $this->assertMatchesRegularExpression('/data-webicon="mdi:pencil-outline"|<iconify-icon icon="mdi:pencil-outline"/', $html);
    }

    public function test_language_menu(): void
    {
        $html = $this->render('<x-oc::language-menu id="lang" ghost value="nl" :options="[\'en\' => [\'label\' => \'English\', \'flag\' => \'flag:gb-4x3\', \'href\' => \'/en/\'], \'nl\' => [\'label\' => \'Nederlands\', \'flag\' => \'flag:nl-4x3\', \'href\' => \'/nl/\']]" />');

        $this->assertElement($html, 'button', 'oc-language-select oc-language-select--ghost', ['popovertarget' => 'lang', 'aria-label' => 'Language: Nederlands']);
        $this->assertElement($html, 'span', 'oc-language-select-code', [], 'NL');
        $this->assertElement($html, 'div', 'oc-dropdown-menu oc-language-menu', ['id' => 'lang', 'aria-label' => 'Language']);
        $this->assertElement($html, 'a', 'oc-dropdown-item', ['href' => '/nl/', 'hreflang' => 'nl', 'lang' => 'nl', 'aria-current' => 'true']);
        // built-in flags are inline SVG now (0.17.0)
        $this->assertStringContainsString('data-webicon="flag:gb-4x3"', $html);

        $compact = $this->render('<x-oc::language-menu compact value="en" :options="[\'en\' => [\'label\' => \'English\']]" />');
        $this->assertElement($compact, 'button', 'oc-language-select oc-language-select--icon oc-tooltip oc-tooltip--bottom', ['data-tooltip' => 'Language: English']);
        $this->assertStringContainsString('data-webicon="mdi:web"', $compact);

        // flags="auto": the flag from the language code (en -> gb, nl-BE -> be); an unknown flag falls back to <iconify-icon>
        $auto = $this->render('<x-oc::language-menu flags="auto" value="en" :options="[\'en\' => [\'label\' => \'English\'], \'nl-BE\' => [\'label\' => \'Vlaams\'], \'es\' => [\'label\' => \'Español\'], \'xx\' => [\'label\' => \'?\', \'flag\' => \'\']]" />');
        $this->assertSame(2, substr_count($auto, 'data-webicon="flag:gb-4x3"'));
        $this->assertStringContainsString('data-webicon="flag:be-4x3"', $auto);
        $this->assertStringContainsString('<iconify-icon icon="flag:xx-4x3"', $auto);
        $this->assertSame('flag:gb-4x3', \Omniacss\Laravel\Webicons::languageFlag('en'));
        $this->assertSame('flag:us-4x3', \Omniacss\Laravel\Webicons::languageFlag('en-US'));
        $this->assertSame('flag:dk-4x3', \Omniacss\Laravel\Webicons::languageFlag('da'));
        $this->assertNull(\Omniacss\Laravel\Webicons::languageFlag('fil'));
    }

    public function test_sheet_options_and_plain_collapsible(): void
    {
        $html = $this->render('<x-oc::sheet id="menu" glass inset footer-panel title="Menu">Body<x-slot:footer>App 1</x-slot:footer></x-oc::sheet>');
        $this->assertElement($html, 'dialog', 'oc-sheet oc-sheet--glass oc-sheet--inset', ['id' => 'menu']);
        $this->assertElement($html, 'div', 'oc-sheet-footer oc-sheet-footer--panel', [], 'App 1');

        $plain = $this->render('<x-oc::collapsible plain title="Help">Text</x-oc::collapsible>');
        $this->assertElement($plain, 'details', 'oc-collapsible oc-collapsible--plain');
    }

    public function test_live_frame_inert_and_device(): void
    {
        $html = $this->render('<x-oc::live-frame src="/preview" title="Preview" device="phone" inert />');
        $this->assertElement($html, 'div', 'oc-live-frame oc-live-frame--phone', ['style' => '--oc-live-w: 390; --oc-live-h: 844']);
        $this->assertMatchesRegularExpression('/<iframe[^>]*tabindex="-1"[^>]*inert aria-hidden="true"/', $html);

        $plain = $this->render('<x-oc::live-frame src="/x" />');
        $this->assertStringNotContainsString('inert', $plain);
        $this->assertStringContainsString('--oc-live-w: 1280; --oc-live-h: 720', $plain);
    }

    public function test_logo_mode_badge_code_plate(): void
    {
        $logo = $this->render('<x-oc::logo src="/logo.svg" alt="Company 1" fit="box" height="2rem" />');
        $this->assertElement($logo, 'span', 'oc-logo oc-logo--box', ['data-plate' => 'auto', 'style' => '--oc-logo-h: 2rem;']);
        $this->assertElement($logo, 'img', '', ['src' => '/logo.svg', 'alt' => 'Company 1']);

        $badge = $this->render('<x-oc::mode-badge mode="both" size="lg" />');
        $this->assertElement($badge, 'span', 'oc-mode-badge oc-mode-badge--lg', ['data-mode' => 'both']);
        $this->assertStringContainsString('<span>Test</span><span>Live</span>', $badge);

        $plate = $this->render('<x-oc::code-plate mode="live" caption="Live"><img src="/qr.svg" alt="QR"></x-oc::code-plate>');
        $this->assertElement($plate, 'figure', 'oc-code-plate', ['data-mode' => 'live']);
        $this->assertElement($plate, 'figcaption', 'oc-code-plate__caption', [], 'Live');
    }

    public function test_card_accent_band(): void
    {
        $card = $this->render('<x-oc::card accent="test" inactive><x-slot:band><x-oc::card-band title="Test round" description="Try it" /></x-slot:band>Body</x-oc::card>');
        $this->assertElement($card, 'div', 'oc-card oc-card--accent', ['data-tone' => 'test', 'data-active' => 'false']);
        $this->assertElement($card, 'div', 'oc-card-band');
        $this->assertElement($card, 'small', '', [], 'Try it');
    }

    public function test_sidebar_meta(): void
    {

        $meta = $this->render('<x-oc::sidebar.meta brand="App 1" version="2.4.0" copyright="© 2026 Company 1" />');
        $this->assertElement($meta, 'div', 'oc-sidebar-meta oc-tooltip oc-tooltip--right', ['data-tooltip' => 'App 1 2.4.0 · © 2026 Company 1', 'tabindex' => '0']);
        $this->assertElement($meta, 'span', 'oc-sidebar-meta__version', [], '2.4.0');
    }
}

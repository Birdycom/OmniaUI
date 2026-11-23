<?php

// File: tests/V0170W3Test.php
// Map: tabs (items, buttons mode, panels) -> card footer + bare -> version banner href/button -> theme switch options + toggle text
//      -> navmenu site -> stat card button -> live frame src + slot -> barcode input error/no preview -> input group addons
//      -> lazy image placeholder/thumb -> price card labels -> media card meta slot -> tint card title link -> color field contrast
// Options of 0.17.0 that bring Blade in line with React and Vue.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Omniacss\Laravel\Color;

class V0170W3Test extends TestCase
{
    public function test_tabs_items_with_icon_count_and_disabled(): void
    {
        $html = $this->render('<x-oc::tabs name="rel" variant="pill" label="Relation type" :tabs="[[\'label\' => \'All\', \'icon\' => \'mdi:check\', \'count\' => 11], [\'label\' => \'Customers\', \'count\' => 5, \'tone\' => \'success\'], [\'label\' => \'RAL\', \'disabled\' => true]]"><x-oc::tabs.panel>1</x-oc::tabs.panel></x-oc::tabs>');
        $this->assertElement($html, 'div', 'oc-tab-list oc-tab-list--pill oc-data-table-tabs', ['role' => 'tablist', 'aria-label' => 'Relation type']);
        $this->assertStringContainsString('data-webicon="mdi:check"', $html);
        $this->assertElement($html, 'span', 'oc-data-table-tab-count oc-data-table-tab-count--success', [], '5');
        $this->assertElement($html, 'input', '', ['type' => 'radio', 'name' => 'rel', 'disabled' => null]);
        $this->assertElement($html, 'div', 'oc-tabset');

        $plain = $this->render('<x-oc::tabs name="t" :tabs="[\'Account\', \'Password\']" />');
        $this->assertElement($plain, 'label', 'oc-tab-trigger', [], 'Account');
        $this->assertElement($plain, 'div', 'oc-tab-list', ['role' => 'tablist']);
    }

    public function test_tabs_buttons_mode_and_panels(): void
    {
        $html = $this->render('<x-oc::tabs name="pal" mode="buttons" variant="pill" :tabs="[\'Omnia\', \'HTML\', [\'label\' => \'RAL\', \'disabled\' => true]]"><x-oc::tabs.panel id="pal-1" active>A</x-oc::tabs.panel><x-oc::tabs.panel id="pal-2">B</x-oc::tabs.panel></x-oc::tabs>');
        $this->assertStringNotContainsString('oc-tabset', $html);
        $this->assertElement($html, 'div', 'oc-tab-list oc-tab-list--pill', ['data-oc-tabs' => null]);
        $this->assertElement($html, 'button', 'oc-tab-trigger', ['role' => 'tab', 'aria-selected' => 'true', 'aria-controls' => 'pal-1'], 'Omnia');
        $this->assertElement($html, 'button', 'oc-tab-trigger', ['aria-selected' => 'false', 'aria-controls' => 'pal-3', 'disabled' => null], 'RAL');
        $this->assertElement($html, 'div', 'oc-tab-panel is-active', ['id' => 'pal-1', 'role' => 'tabpanel'], 'A');
        $this->assertElement($html, 'div', 'oc-tab-panel', ['id' => 'pal-2', 'role' => 'tabpanel'], 'B');
    }

    public function test_card_footer_classes_and_bare(): void
    {
        $html = $this->render('<x-oc::card title="Import" footer-divider footer-end footer-class="mt-2" bare><table class="oc-table"></table><x-slot:footer>Stop</x-slot:footer></x-oc::card>');
        $this->assertElement($html, 'div', 'oc-card-footer oc-card-footer--divider oc-card-footer--end mt-2', [], 'Stop');
        $this->assertStringNotContainsString('oc-card-content', $html);
        $this->assertStringContainsString('<table class="oc-table"></table>', $html);

        $plain = $this->render('<x-oc::card>Body<x-slot:footer>F</x-slot:footer></x-oc::card>');
        $this->assertElement($plain, 'div', 'oc-card-content', [], 'Body');
        $this->assertElement($plain, 'div', 'oc-card-footer', [], 'F');
    }

    public function test_version_banner_href_button_and_short(): void
    {
        $link = $this->render('<x-oc::version-banner version="v0.6.0" href="/changelog" short="" />');
        $this->assertElement($link, 'a', 'oc-version-banner-action', ['href' => '/changelog'], 'Reload');
        $this->assertStringNotContainsString('oc-version-banner-short', $link);

        $button = $this->render('<x-oc::version-banner version="v0.6.0" tone="info" button action="Install" :action-attributes="[\'wire:click\' => \'install\']">Update ready</x-oc::version-banner>');
        $this->assertElement($button, 'button', 'oc-version-banner-action', ['type' => 'button', 'wire:click' => 'install'], 'Install');
        $this->assertStringNotContainsString('<a ', $button);

        $default = $this->render('<x-oc::version-banner version="v0.6.0" />');
        $this->assertElement($default, 'a', 'oc-version-banner-action', ['href' => '']);
        $this->assertElement($default, 'span', 'oc-version-banner-short', [], 'New version');
    }

    public function test_theme_switch_options_and_toggle_text(): void
    {
        $html = $this->render('<x-oc::theme-switch :options="[\'light\', \'dark\']" />');
        $this->assertStringNotContainsString('value="system"', $html);
        $this->assertSame(2, substr_count($html, 'type="radio"'));
        $this->assertStringContainsString('value="light" checked', $html);

        $toggle = $this->render('<x-oc::theme-toggle text :ghost="false" />');
        $this->assertElement($toggle, 'button', 'oc-btn oc-btn--outline', ['data-oc-theme-toggle' => null]);
        $this->assertElement($toggle, 'span', 'oc-theme-img--light', [], 'Dark theme');
        $this->assertElement($toggle, 'span', 'oc-theme-img--dark', [], 'Light theme');
        $this->assertStringNotContainsString('data-tooltip', $toggle);
    }

    public function test_navmenu_site_variant(): void
    {
        $html = $this->render('<x-oc::navmenu variant="site" :items="[[\'label\' => \'Docs\', \'href\' => \'/docs\', \'current\' => true]]" />');
        $this->assertElement($html, 'ul', 'oc-navmenu oc-navmenu--site');
        $this->assertElement($this->render('<x-oc::navmenu :items="[]" />'), 'ul', 'oc-navmenu');
    }

    public function test_stat_card_as_button(): void
    {
        $html = $this->render('<x-oc::stat-card button value="3" label="Open" tone="warning" stripe popovertarget="m1" />');
        $this->assertElement($html, 'button', 'oc-stat-card oc-stat-card--warning oc-stat-card--stripe', ['type' => 'button', 'popovertarget' => 'm1']);
    }

    public function test_live_frame_src_and_slot(): void
    {
        $html = $this->render('<x-oc::live-frame src="/samples/company-1.html" static><span class="oc-watermark">Concept</span></x-oc::live-frame>');
        $this->assertStringContainsString('<iframe src="/samples/company-1.html"', $html);
        $this->assertElement($html, 'span', 'oc-watermark', [], 'Concept');
    }

    public function test_barcode_input_error_text_and_hide_preview(): void
    {
        $html = $this->render('<x-oc::barcode-input value="54123" error error-text="Use 8 or 13 digits" />');
        $this->assertElement($html, 'figure', 'oc-barcode-preview oc-barcode-preview--empty');
        $this->assertElement($html, 'figcaption', 'oc-barcode-preview-code', [], 'Use 8 or 13 digits');
        $this->assertElement($html, 'input', 'oc-input oc-barcode-input-field', ['aria-invalid' => 'true']);

        $bare = $this->render('<x-oc::barcode-input hide-preview />');
        $this->assertStringNotContainsString('<figure', $bare);

        $ok = $this->render('<x-oc::barcode-input value="5412345678908" error-text="Use 8 or 13 digits" />');
        $this->assertElement($ok, 'figcaption', 'oc-barcode-preview-code', [], '5412345678908');
    }

    public function test_input_group_icon_and_slot_addons(): void
    {
        $icon = $this->render('<x-oc::input-group affix prefix-icon="mdi:check" name="q" />');
        $this->assertElement($icon, 'div', 'oc-input-group oc-input-group--affix');
        $this->assertElement($icon, 'span', 'oc-input-addon', ['aria-hidden' => 'true']);
        $this->assertStringContainsString('data-webicon="mdi:check"', $icon);

        $slot = $this->render('<x-oc::input-group name="code"><x-slot:prefix><svg viewBox="0 0 16 16"></svg></x-slot:prefix><x-slot:suffix>EAN</x-slot:suffix></x-oc::input-group>');
        $this->assertStringContainsString('<span class="oc-input-addon"><svg viewBox="0 0 16 16"></svg></span>', $slot);
        $this->assertElement($slot, 'span', 'oc-input-addon', [], 'EAN');

        $text = $this->render('<x-oc::input-group prefix="https://" name="website" />');
        $this->assertElement($text, 'span', 'oc-input-addon', [], 'https://');
        $this->assertElement($text, 'div', 'oc-input-group');
    }

    public function test_lazy_image_placeholder_and_thumb(): void
    {
        $html = $this->render('<x-oc::lazy-image alt="Loading" preview="/img/tiny.jpg" />');
        $this->assertStringNotContainsString('<img', $html);
        $this->assertElement($html, 'figure', 'oc-lazy', ['role' => 'img', 'aria-label' => 'Loading']);

        $thumb = $this->render('<x-oc::lazy-image thumb src="/img/p1.svg" alt="" width="40" height="40" />');
        $this->assertElement($thumb, 'figure', 'oc-lazy oc-lazy--thumb');
        $this->assertStringNotContainsString('role="img"', $thumb);
    }

    public function test_price_card_group_label_and_texts(): void
    {
        $html = $this->render('<x-oc::price-card name="Starter" group="oc-price-starter" group-label="Billing period, Starter" monthly-label="Per month" :monthly="[\'amount\' => \'€5\']" :yearly="[\'amount\' => \'€50\']" />');
        $this->assertElement($html, 'div', 'oc-segmented oc-price-card__toggle', ['aria-label' => 'Billing period, Starter']);
        $this->assertElement($html, 'label', 'oc-segmented-item', [], 'Per month');
        $this->assertSame(2, substr_count($html, 'name="oc-price-starter"'));
    }

    public function test_media_card_meta_slot(): void
    {
        $html = $this->render('<x-oc::media-card title="Video 1" href="/v/1"><x-slot:meta><a href="/c/1">Channel 1</a> · 24K views</x-slot:meta></x-oc::media-card>');
        $this->assertStringContainsString('<p class="oc-media-card__meta"><a href="/c/1">Channel 1</a> · 24K views</p>', $html);
        $none = $this->render('<x-oc::media-card title="Video 1" href="/v/1" />');
        $this->assertStringNotContainsString('oc-media-card__meta', $none);
    }

    public function test_tint_card_title_link(): void
    {
        $html = $this->render('<x-oc::tint-card title="Backup" title-href="#backup" tone="info">Text</x-oc::tint-card>');
        $this->assertStringContainsString('<article', $html);
        $this->assertElement($html, 'a', 'oc-tint-card__link', ['href' => '#backup'], 'Backup');
    }

    public function test_color_math_matches_react_and_vue(): void
    {
        $this->assertSame([51, 102, 204], Color::toRgb('#36c'));
        $this->assertNull(Color::toRgb('var(--oc-background)'));
        $this->assertEqualsWithDelta(21.0, Color::contrastRatio('#000000', '#ffffff'), 0.001);
        $this->assertSame('#0b1020', Color::pickOnColor('#f2c94c'));
        $this->assertSame('#ffffff', Color::pickOnColor('#1e3a8a'));
    }

    public function test_color_field_contrast_report(): void
    {
        $html = $this->render('<x-oc::color-field label="Brand color" id="c2" value="#f2c94c" :contrast-against="[[\'name\' => \'the light page\', \'color\' => \'#ffffff\'], [\'name\' => \'the dark page\', \'color\' => \'#0b1020\']]" />');
        $this->assertElement($html, 'ul', 'oc-color-field-report', ['aria-live' => 'polite']);
        $this->assertElement($html, 'li', 'oc-color-field-check', ['data-ok' => 'true'], 'AaText on this color11.9:1 · OK');
        $this->assertElement($html, 'li', 'oc-color-field-check', ['data-ok' => 'false', 'data-bg' => '#ffffff'], 'On the light page1.6:1 · Too low');
        $this->assertElement($html, 'li', 'oc-color-field-check', ['data-ok' => 'true', 'data-bg' => '#0b1020'], 'On the dark page11.9:1 · OK');

        $plain = $this->render('<x-oc::color-field value="#2f80ed" />');
        $this->assertStringNotContainsString('class="oc-color-field-report"', $plain);
        $only = $this->render('<x-oc::color-field value="#2f80ed" contrast :contrast-labels="[\'ok\' => \'Goed\']" />');
        $this->assertSame(1, substr_count($only, 'class="oc-color-field-check"'));
        $this->assertStringContainsString('4.9:1 · Goed', $only);
    }
}

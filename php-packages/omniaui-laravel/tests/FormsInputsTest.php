<?php

// File: tests/FormsInputsTest.php
// Map: group A form components -> one test per Blade component (classes, modifiers, attribute forwarding).

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class FormsInputsTest extends TestCase
{
    public function test_phone_input_renders_dial_select_and_tel_input(): void
    {
        $html = $this->render('<x-oc::phone-input name="tel" dial="+31" size="sm" :error="true" placeholder="470" />');

        $this->assertElement($html, 'div', 'oc-phone-input oc-phone-input--sm oc-phone-input--error');
        $this->assertElement($html, 'input', 'oc-phone-input-number', ['type' => 'tel', 'name' => 'tel', 'placeholder' => '470', 'aria-invalid' => 'true']);
        $this->assertStringContainsString('<option value="+31" selected>NL +31</option>', $html);
    }

    public function test_number_input_has_step_buttons_and_script_once(): void
    {
        $html = $this->render('<x-oc::number-input name="qty" :value="2" min="0" max="9" block /><x-oc::number-input name="b" />');

        $this->assertElement($html, 'div', 'oc-number-input oc-number-input--block');
        $this->assertElement($html, 'input', 'oc-number-input-field', ['type' => 'number', 'name' => 'qty', 'value' => '2', 'min' => '0', 'max' => '9']);
        $this->assertElement($html, 'button', 'oc-number-input-step', ['data-oc-step' => '1', 'aria-label' => 'Increase']);
        $this->assertSame(1, substr_count($html, '<script>'));
    }

    public function test_affix_input_variants(): void
    {
        $currency = $this->render('<x-oc::affix-input variant="currency" name="price" />');
        $this->assertElement($currency, 'div', 'oc-input-group oc-input-group--affix');
        $this->assertStringContainsString('<span class="oc-input-addon" aria-hidden="true">€</span>', $currency);
        $this->assertElement($currency, 'input', 'oc-input', ['inputmode' => 'decimal', 'name' => 'price']);

        $email = $this->render('<x-oc::affix-input variant="email" :error="true" />');
        $this->assertElement($email, 'div', 'oc-input-group oc-input-group--affix oc-input-group--error');
        $this->assertElement($email, 'input', 'oc-input', ['type' => 'email', 'aria-invalid' => 'true']);
    }

    public function test_decimal_input_with_and_without_unit(): void
    {
        $this->assertElement($this->render('<x-oc::decimal-input name="a" start />'), 'input', 'oc-input oc-decimal-input oc-decimal-input--start', ['inputmode' => 'decimal', 'name' => 'a']);

        $unit = $this->render('<x-oc::decimal-input name="s" unit="m²" />');
        $this->assertElement($unit, 'div', 'oc-decimal-field');
        $this->assertStringContainsString('<span class="oc-decimal-field-unit">m²</span>', $unit);
    }

    public function test_time_input_links_its_datalist(): void
    {
        $html = $this->render('<x-oc::time-input id="t1" name="start" :slots="[\'08:00\', \'08:30\']" />');

        $this->assertElement($html, 'input', 'oc-input oc-time-input', ['id' => 't1', 'list' => 't1-slots', 'name' => 'start']);
        $this->assertStringContainsString('<datalist id="t1-slots">', $html);
        $this->assertSame(2, substr_count($html, '<option'));
    }

    public function test_barcode_input_preview_states(): void
    {
        $empty = $this->render('<x-oc::barcode-input label="EAN" id="b1" />');
        $this->assertElement($empty, 'label', 'oc-field-label', ['for' => 'b1'], 'EAN');
        $this->assertElement($empty, 'figure', 'oc-barcode-preview oc-barcode-preview--empty');
        $this->assertStringContainsString('No code yet', $empty);

        $filled = $this->render('<x-oc::barcode-input value="5412345678908" />');
        $this->assertElement($filled, 'figure', 'oc-barcode-preview');
        $this->assertElement($filled, 'figcaption', 'oc-barcode-preview-code', [], '5412345678908');
    }

    public function test_color_select_sets_swatch_variable(): void
    {
        $html = $this->render('<x-oc::color-select name="c" value="red" list :options="[\'red\' => [\'Red\', \'var(--color-red-70)\']]" />');

        $this->assertElement($html, 'fieldset', 'oc-color-select oc-color-select--list', ['role' => 'radiogroup']);
        $this->assertElement($html, 'label', 'oc-color-select-option', ['style' => '--oc-swatch: var(--color-red-70)']);
        $this->assertElement($html, 'input', '', ['type' => 'radio', 'value' => 'red', 'checked' => null]);
    }

    public function test_language_select_currency_variant(): void
    {
        $html = $this->render('<x-oc::language-select name="cur" currency ghost value="USD" :options="[\'EUR\' => \'EUR\', \'USD\' => \'USD\']" />');

        $this->assertElement($html, 'label', 'oc-language-select oc-language-select--ghost oc-language-select--currency');
        $this->assertElement($html, 'select', 'oc-language-select-control', ['name' => 'cur', 'aria-label' => 'Currency']);
        $this->assertStringContainsString('<option value="USD" selected>USD</option>', $html);
    }

    public function test_toggle_field_puts_attributes_on_the_switch(): void
    {
        $html = $this->render('<x-oc::toggle-field id="n1" name="news" label="News" description="Weekly" card checked class="mt-2" />');

        $this->assertElement($html, 'label', 'oc-toggle-field oc-toggle-field--card mt-2');
        $this->assertElement($html, 'input', '', ['role' => 'switch', 'name' => 'news', 'checked' => null, 'aria-describedby' => 'n1-desc']);
        $this->assertElement($html, 'span', 'oc-toggle-field-description', ['id' => 'n1-desc'], 'Weekly');
    }

    public function test_password_requirements_rules_and_script(): void
    {
        $html = $this->render('<x-oc::password-requirements for="pw" inline />');

        $this->assertElement($html, 'ul', 'oc-password-requirements oc-password-requirements--inline', ['aria-live' => 'polite', 'data-oc-password-for' => 'pw']);
        $this->assertElement($html, 'li', 'oc-password-requirement', ['data-min' => '8'], 'At least 8 characters');
        $this->assertStringContainsString('<script>', $html);
    }

    public function test_chip_filter_multiple_uses_checkboxes(): void
    {
        $html = $this->render('<x-oc::chip-filter name="type" multiple :value="[\'a\']" :options="[\'a\' => [\'A\', 3], \'b\' => \'B\']" />');

        $this->assertElement($html, 'div', 'oc-chip-filter', ['role' => 'group']);
        $this->assertElement($html, 'input', '', ['type' => 'checkbox', 'name' => 'type[]', 'value' => 'a', 'checked' => null]);
        $this->assertElement($html, 'span', 'oc-chip-filter-count', [], '3');
    }

    public function test_filter_counts_tiles_and_tones(): void
    {
        $html = $this->render('<x-oc::filter-counts name="view" value="all" compact :options="[[\'value\' => \'active\', \'label\' => \'Active\', \'count\' => 5, \'tone\' => \'success\'], [\'value\' => \'all\', \'label\' => \'All\', \'count\' => 9]]" />');

        $this->assertElement($html, 'fieldset', 'oc-filter-counts oc-filter-counts--compact', ['role' => 'radiogroup']);
        $this->assertElement($html, 'label', 'oc-filter-counts-item oc-filter-counts-item--success');
        $this->assertElement($html, 'input', '', ['value' => 'all', 'checked' => null]);
        $this->assertElement($html, 'span', 'oc-filter-counts-value', [], '9');
    }
}

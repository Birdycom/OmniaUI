<?php

// File: tests/V0170Test.php
// Map: dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group -> copy field display -> icon props as inline SVG -> data table labels, view, pagination, bulk
// Components and options of 0.17.0: Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170Test extends TestCase
{
    public function test_dropdown_item_description_and_tone(): void
    {
        $html = $this->render('<x-oc::dropdown label="New stop" :items="[[\'label\' => \'Checkpoint\', \'href\' => \'/new/checkpoint\', \'icon\' => \'mdi:check\', \'tone\' => \'success\', \'description\' => \'Players scan a code here\'], [\'label\' => \'Plain\', \'href\' => \'/p\']]" />');

        $this->assertElement($html, 'span', 'oc-dropdown-icon oc-dropdown-icon--success', ['aria-hidden' => 'true']);
        $this->assertStringContainsString('data-webicon="mdi:check"', $html);
        $this->assertElement($html, 'span', 'oc-dropdown-desc', [], 'Players scan a code here');
        $this->assertSame(1, substr_count($html, 'oc-dropdown-text'));
    }

    public function test_sidebar_meta_wrap_and_collapsed(): void
    {
        $html = $this->render('<x-oc::sidebar.meta wrap brand="App 1" version="2.4.0" copyright="© 2026 Company 1" />');
        $this->assertElement($html, 'div', 'oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--wrap');
        $collapsed = $this->render('<x-oc::sidebar.meta collapsed version="2.4.0" />');
        $this->assertElement($collapsed, 'div', 'oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--collapsed');
    }

    public function test_form_section_invalid_and_count(): void
    {
        $html = $this->render('<x-oc::form-section title="Location" invalid="error" :issues="2" icon="mdi:map-marker-outline">Fields</x-oc::form-section>');
        $this->assertElement($html, 'details', 'oc-form-section', ['data-issue' => 'error']);
        $this->assertElement($html, 'span', 'oc-form-section__count', ['aria-label' => '2 errors'], '2');
        $plain = $this->render('<x-oc::form-section title="Name" :issues="2">Fields</x-oc::form-section>');
        $this->assertStringNotContainsString('data-issue', $plain);
        $this->assertStringNotContainsString('oc-form-section__count', $plain);
    }

    public function test_otp_fit_and_group(): void
    {
        $html = $this->render('<x-oc::otp-input :length="8" fit :group="4" alphanumeric />');
        $this->assertElement($html, 'input', 'oc-otp oc-otp--fit oc-otp--group', ['maxlength' => '8', 'inputmode' => 'text', 'style' => '--oc-otp-length: 8; --oc-otp-group: 4']);
        $this->assertStringNotContainsString('pattern=', $html);
    }

    public function test_copy_field_display(): void
    {
        $html = $this->render('<x-oc::copy-field display="lg" :group="4" value="K7QM2XPA" label="Join code" caption="Type it in the app" />');
        $this->assertElement($html, 'div', 'oc-copy-field oc-copy-field--display oc-copy-field--lg');
        $this->assertElement($html, 'input', 'oc-copy-field-value', ['value' => 'K7QM 2XPA']);
        $this->assertElement($html, 'button', 'oc-copy-field-button', ['data-copy' => 'K7QM2XPA']);
        $this->assertElement($html, 'p', 'oc-copy-field-caption', [], 'Type it in the app');
    }

    public function test_icon_props_render_inline_svg(): void
    {
        $html = $this->render('<x-oc::breadcrumb :items="[[\'label\' => \'Home\', \'href\' => \'/\', \'icon\' => \'mdi:check\'], [\'label\' => \'Page\']]" />');
        $this->assertStringContainsString('data-webicon="mdi:check"', $html);
        $this->assertStringNotContainsString('class=""', $html);
        // an icon that is not on disk still works with the Iconify runtime
        $unknown = $this->render('<x-oc::feature-card icon="mdi:no-such-icon-xyz" title="T">x</x-oc::feature-card>');
        $this->assertStringContainsString('<iconify-icon icon="mdi:no-such-icon-xyz"', $unknown);
    }

    public function test_data_table_labels_and_switches(): void
    {
        $html = $this->render(<<<'BLADE'
            <x-oc::data-table title="Spellen" :columns="[['key' => 'name', 'header' => 'Naam']]" :rows="[['key' => '1', 'cells' => ['name' => 'Game 1']]]" :labels="['exportCsv' => 'CSV exporteren', 'search' => '{name} zoeken', 'nextPage' => 'Volgende pagina']" :view="false" :pagination="false" :filters="false" />
            BLADE);
        $this->assertStringContainsString('CSV exporteren', $html);
        $this->assertStringContainsString('aria-label="Spellen zoeken"', $html);
        $this->assertStringContainsString('data-oc-labels="{&quot;nextPage&quot;:&quot;Volgende pagina&quot;}"', $html);
        $this->assertStringContainsString('data-oc-no-grid', $html);
        $this->assertStringContainsString('data-page-size="0"', $html);
        $this->assertStringNotContainsString('oc-data-table-view', $html);
        $this->assertStringNotContainsString('oc-data-table-pager', $html);
        $this->assertStringNotContainsString('oc-data-table-bulk', $html);
    }
}

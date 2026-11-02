<?php

// File: tests/AppDataUxTest.php | Map: data components (table actions, column menu, sortable row, tree, table compact,
//   list toolbar, alpha tabs) -> app UX components (top progress, confirm dialog, version banner, greeting, stat card,
//   severity card, upgrade banner, page header, accordion accent)
// Group B (data and app UX) Blade components: each renders the same classes as its snippet.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class AppDataUxTest extends TestCase
{
    public function test_table_actions_icons_and_menu(): void
    {
        $icons = $this->render('<table><tr><x-oc::table-actions><a class="oc-table-actions-icon" href="/e" aria-label="Edit">e</a></x-oc::table-actions></tr></table>');
        $this->assertStringContainsString('class="oc-table-actions oc-table-actions--icons"', $icons);

        $menu = $this->render('<table><tr><x-oc::table-actions menu="Actions for Ada" id="m1"><a class="oc-dropdown-item">View</a></x-oc::table-actions></tr></table>');
        $this->assertElement($menu, 'button', 'oc-table-actions-more', ['popovertarget' => 'm1', 'aria-label' => 'Actions for Ada']);
        $this->assertElement($menu, 'div', 'oc-dropdown-menu', ['id' => 'm1', 'popover' => null]);
    }


    public function test_sortable_row_states(): void
    {
        $html = $this->render('<table><x-oc::sortable-row grip="Move Install" dragging drop="after"><td>Install</td></x-oc::sortable-row></table>');
        $this->assertElement($html, 'tr', 'oc-sortable-row is-dragging is-drop-after', ['draggable' => 'true']);
        $this->assertElement($html, 'button', 'oc-sortable-row-grip', ['aria-label' => 'Move Install']);
    }

    public function test_tree_nests_folders_and_marks_current(): void
    {
        $html = $this->render('<x-oc::tree head="All" :items="[[\'label\' => \'Kitchen\', \'open\' => true, \'children\' => [[\'label\' => \'Quote\', \'href\' => \'/q\', \'current\' => true]]]]" />');
        $this->assertElement($html, 'details', 'oc-tree-node', ['open' => null]);
        $this->assertElement($html, 'a', 'oc-tree-label', ['href' => '/q', 'aria-current' => 'true']);
        $this->assertStringContainsString('oc-tree-row oc-tree-head', $html);
    }

    public function test_table_compact_builds_the_table(): void
    {
        $html = $this->render('<x-oc::table-compact bordered :columns="[\'n\' => \'Item\', \'q\' => [\'label\' => \'Qty\', \'numeric\' => true]]" :rows="[[\'n\' => \'Sink\', \'q\' => 1]]" :footer="[\'n\' => \'Total\']" />');
        $this->assertStringContainsString('class="oc-table-compact oc-table-compact--bordered"', $html);
        $this->assertStringContainsString('<td data-numeric>1</td>', $html);
        $this->assertStringContainsString('<tfoot><tr><td>Total</td>', $html);
    }

    public function test_list_toolbar_and_alpha_tabs(): void
    {
        $bar = $this->render('<x-oc::list-toolbar count="3 items" :views="[\'cards\' => \'Cards\', \'table\' => \'Table\']" view="table" />');
        $this->assertStringContainsString('<span class="oc-list-toolbar-count">3 items</span>', $bar);
        $this->assertStringContainsString('value="table" aria-label="Table" checked', $bar);

        $tabs = $this->render('<x-oc::alpha-tabs current="B" :letters="[\'A\', \'B\', \'C\']" :available="[\'A\', \'B\']" />');
        $this->assertElement($tabs, 'a', 'oc-alpha-tabs-item', ['href' => '?letter=B', 'aria-current' => 'true']);
        $this->assertElement($tabs, 'a', 'oc-alpha-tabs-item', ['aria-disabled' => 'true'], 'C');
    }

    public function test_top_progress_confirm_dialog_and_version_banner(): void
    {
        $bar = $this->render('<x-oc::top-progress tone="brand" :value="40" static />');
        $this->assertElement($bar, 'progress', 'oc-top-progress oc-top-progress--brand oc-top-progress--static', ['value' => '40']);

        $dlg = $this->render('<x-oc::confirm-dialog id="del" title="Delete?" word="DELETE" discard="Don\'t save">Gone.</x-oc::confirm-dialog>');
        $this->assertStringContainsString('oc-alert-dialog--error oc-alert-dialog--confirm', $dlg);
        $this->assertStringContainsString('pattern="DELETE" required', $dlg);
        $this->assertStringContainsString('oc-alert-dialog-discard', $dlg);

        $ver = $this->render('<x-oc::version-banner version="v0.6.0" tone="info" />');
        $this->assertElement($ver, 'div', 'oc-version-banner oc-version-banner--info', ['role' => 'status']);
        $this->assertStringContainsString('New version (v0.6.0) available', $ver);
    }

    public function test_greeting_stat_card_and_severity_card(): void
    {
        $greet = $this->render('<x-oc::greeting name="Ada" date="2026-10-15 08:30" />');
        $this->assertStringContainsString('class="oc-greeting oc-greeting--morning"', $greet);
        $this->assertStringContainsString('datetime="2026-10-15"', $greet);

        $stat = $this->render('<x-oc::stat-card value="7" label="Open orders" tone="accent" href="/orders" trend="+2" />');
        $this->assertElement($stat, 'a', 'oc-stat-card oc-stat-card--accent', ['href' => '/orders']);
        $this->assertStringContainsString('oc-stat-card-trend--up', $stat);

        $sev = $this->render('<x-oc::severity-card level="critical" title="Bank" :tags="[\'iban\']" resolved>Call.</x-oc::severity-card>');
        $this->assertElement($sev, 'details', 'oc-severity-card oc-severity-card--critical is-resolved');
        $this->assertStringContainsString('<span class="oc-severity-card-level">Critical</span>', $sev);
    }

    public function test_upgrade_banner_page_header_and_accordion_accent(): void
    {
        $up = $this->render('<x-oc::upgrade-banner title="Free plan" plan="Free" usage="Projects" :used="4" :max="5" dismissible>Limits.</x-oc::upgrade-banner>');
        $this->assertStringContainsString('<span class="oc-upgrade-banner-plan">Free</span>', $up);
        $this->assertElement($up, 'meter', 'oc-upgrade-banner-meter', ['value' => '4', 'max' => '5']);
        $this->assertStringContainsString('oc-upgrade-banner-dismiss', $up);

        $head = $this->render('<x-oc::page-header title="Invoices" :level="2" bordered />');
        $this->assertElement($head, 'h2', 'oc-page-header-title', [], 'Invoices');
        $this->assertStringContainsString('class="oc-page-header oc-page-header--bordered"', $head);

        $acc = $this->render('<x-oc::accordion-accent accent="violet" flush><x-oc::accordion.item title="One">1</x-oc::accordion.item></x-oc::accordion-accent>');
        $this->assertStringContainsString('class="oc-accordion oc-accordion--accent oc-accordion--flush oc-accent--violet"', $acc);
    }

    public function test_data_table_renders_the_list_shell(): void
    {
        $html = $this->render('<x-oc::data-table title="Articles" table-id="articles" :page-size="15" :columns="[[\'key\' => \'sku\', \'header\' => \'Article ID\'], [\'key\' => \'price\', \'header\' => \'Price\', \'numeric\' => true]]" :rows="[[\'key\' => \'1\', \'status\' => \'active\', \'cells\' => [\'sku\' => \'SET-SCHAR\', \'name\' => \'Scharnier\', \'price\' => \'5,15\'], \'values\' => [\'price\' => \'5.15\']]]" />');

        $this->assertStringContainsString('id="articles"', $html);
        $this->assertStringContainsString('class="oc-data-table"', $html);
        $this->assertStringContainsString('data-oc-filter="deleted"', $html);
        $this->assertStringContainsString('data-oc-key="1"', $html);
        $this->assertStringContainsString('data-oc-value="5.15"', $html);
        $this->assertStringContainsString('data-oc-sort="numeric"', $html);
        $this->assertStringContainsString('<option value="15" selected>15</option>', $html);
    }

    public function test_data_table_renders_tabs_column_filters_and_truncated_cells(): void
    {
        $html = $this->render('<x-oc::data-table title="Customers" table-id="customers" :draggable="false" summary="Showing {from}–{to} of {total} customers"'
            .' :columns="[[\'key\' => \'name\', \'header\' => \'Name\'], [\'key\' => \'address\', \'header\' => \'Address\', \'truncate\' => \'12rem\'], [\'key\' => \'region\', \'header\' => \'Region\']]"'
            .' :rows="[[\'key\' => \'noord\', \'cells\' => [\'name\' => \'Company 1\', \'address\' => \'Noorderlaan 88, 2030 Antwerpen\', \'region\' => \'Antwerp\'], \'values\' => [\'type\' => \'company\']]]"'
            .' :tabs="[\'column\' => \'type\', \'items\' => [[\'value\' => \'\', \'label\' => \'All\', \'count\' => 1], [\'value\' => \'company\', \'label\' => \'Companies\', \'icon\' => \'mdi:domain\', \'count\' => 1]]]"'
            .' :column-filters="[[\'column\' => \'region\', \'label\' => \'Region\', \'options\' => [\'\' => \'All regions\', \'Antwerp\' => \'Antwerp\']]]" />');

        $this->assertStringContainsString('data-oc-col-filter="type" data-oc-value="company" aria-selected="false"', $html);
        $this->assertStringContainsString('<span class="oc-data-table-tab-count">1</span>', $html);
        $this->assertStringContainsString('<select class="oc-select" data-oc-col-filter="region" aria-label="Region">', $html);
        $this->assertStringContainsString('style="--oc-data-table-truncate: 12rem" title="Noorderlaan 88, 2030 Antwerpen"', $html);
        $this->assertStringContainsString('data-oc-summary="Showing {from}–{to} of {total} customers"', $html);
        $this->assertStringContainsString('aria-label="Edit Company 1"', $html);
        $this->assertStringNotContainsString('data-oc-col="order"', $html);
    }

    public function test_data_table_name_renders_avatar_badge_and_second_line(): void
    {
        $html = $this->render('<x-oc::data-table-name name="Company 1" sub="BE0000.000.001"><x-slot:badge><span class="oc-badge">Company</span></x-slot:badge></x-oc::data-table-name>');

        $this->assertStringContainsString('<span class="oc-avatar" aria-hidden="true">C1</span>', $html);
        $this->assertStringContainsString('Company 1 <span class="oc-badge">Company</span>', $html);
        $this->assertStringContainsString('<span class="oc-data-table-name-sub">BE0000.000.001</span>', $html);
    }

    public function test_v0126_components_render(): void
    {
        $card = $this->render('<x-oc::name-card name="Worktop" amount="€ 1.940,00" renamable open>Body</x-oc::name-card>');
        $this->assertStringContainsString('<span class="oc-name-card__title">Worktop</span>', $card);
        $this->assertStringContainsString('data-oc-rename', $card);
        $this->assertStringContainsString('<span class="oc-name-card__amount">€ 1.940,00</span>', $card);

        $date = $this->render('<x-oc::date-field name="start" value="2027-01-01" week-label="Week {week} · {year}" />');
        $this->assertStringContainsString('Week 53 · 2026</output>', $date);
        $this->assertStringContainsString('type="date"', $date);

        $code = $this->render('<x-oc::barcode value="5400000000010" size="hero" />');
        $this->assertStringContainsString('class="oc-barcode oc-barcode--hero" data-value="5400000000010"', $code);

        $section = $this->render('<x-oc::form-section title="Address" hint="Invoice address" icon="mdi:map-marker-outline" name="contact" open>Fields</x-oc::form-section>');
        $this->assertStringContainsString('name="contact" open', $section);
        $this->assertStringContainsString('<span class="oc-form-section__title">Address</span>', $section);

        $picker = $this->render('<x-oc::avatar-picker initials="C1" name="logo" logo />');
        $this->assertStringContainsString('oc-avatar-picker oc-avatar-picker--square oc-avatar-picker--logo', $picker);
        $this->assertStringContainsString('name="logo" type="file"', $picker);
        $this->assertStringContainsString('data-oc-max-kb="2048"', $this->render('<x-oc::avatar-picker initials="C1" :max-kb="2048" />'));
        $bag = (new \Illuminate\Support\ViewErrorBag())->put('default', new \Illuminate\Support\MessageBag(['avatar' => ['The avatar must be an image.']]));
        \Illuminate\Support\Facades\View::share('errors', $bag);
        $refused = $this->render('<x-oc::avatar-picker initials="C1" />');
        $this->assertStringContainsString('is-invalid', $refused);
        $this->assertStringContainsString('<span class="oc-avatar-picker__error" role="alert">The avatar must be an image.</span>', $refused);

        $meter = $this->render('<x-oc::meter-row label="Storage" :percent="96" value="9.6 / 10 GB" />');
        $this->assertStringContainsString('data-level="critical" style="--oc-meter: 96%"', $meter);
    }

}

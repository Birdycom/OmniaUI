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

    public function test_column_menu_numbers_and_locks_columns(): void
    {
        $html = $this->render('<x-oc::column-menu id="cm" :columns="[[\'label\' => \'Name\', \'locked\' => true], [\'label\' => \'Phone\', \'visible\' => false]]"><table class="oc-table"></table></x-oc::column-menu>');
        $this->assertStringContainsString('popovertarget="cm"', $html);
        $this->assertStringContainsString('data-col="1" checked disabled', $html);
        $this->assertStringContainsString('data-col="2" >', $html);
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
        $this->assertStringContainsString('class="oc-data-table oc-column-menu-scope"', $html);
        $this->assertStringContainsString('data-oc-filter="deleted"', $html);
        $this->assertStringContainsString('data-oc-key="1"', $html);
        $this->assertStringContainsString('data-oc-value="5.15"', $html);
        $this->assertStringContainsString('data-oc-sort="numeric"', $html);
        $this->assertStringContainsString('<option value="15" selected>15</option>', $html);
    }

}

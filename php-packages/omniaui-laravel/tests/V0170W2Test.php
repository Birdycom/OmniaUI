<?php

// File: tests/V0170W2Test.php
// Map: slot end before text -> paper -> footerbar -> tag list -> toc -> expandable table + show more -> demo panel -> product card
//      -> badge source -> icon list -> shot grid + browser frame mark -> disabled options -> sortable row grabbed -> tree icon/actions
//      -> meter row value slot -> timeline compact -> table compact footer span -> data table badge -> stepper hook -> alert dialog discard
//      -> message action hooks -> upgrade banner dismiss -> phone input dial
// Components and options of 0.17.0 (package W2): Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Illuminate\Support\Facades\Blade;

class V0170W2Test extends TestCase
{
    public function test_a_word_right_after_a_closing_slot_tag_closes_the_slot(): void
    {
        $level = ob_get_level();
        $html = $this->render('<x-oc::callout><x-slot:action>Go</x-slot:action>Body</x-oc::callout>');
        $this->assertSame($level, ob_get_level(), 'no output buffer left open');
        $this->assertElement($html, 'div', 'oc-callout__action', [], 'Go');
        $this->assertStringNotContainsString('@endslot', $html);
        $this->assertStringContainsString('Body', $html);
    }

    public function test_paper(): void
    {
        $html = $this->render('<x-oc::paper.lift><x-oc::paper sheet lined margin edge="torn" tone="kraft">Notes</x-oc::paper></x-oc::paper.lift>');
        $this->assertElement($html, 'div', 'oc-paper-lift');
        $this->assertElement($html, 'div', 'oc-paper oc-paper--kraft oc-paper--sheet oc-paper--lined oc-paper--margin oc-paper--torn', [], 'Notes');
        $theme = $this->render('<x-oc::paper as="section" theme squares>x</x-oc::paper>');
        $this->assertElement($theme, 'section', 'oc-paper-theme oc-paper oc-paper--grid');
    }

    public function test_footerbar(): void
    {
        $this->assertElement($this->render('<x-oc::footerbar>Version 1</x-oc::footerbar>'), 'footer', 'oc-footerbar', [], 'Version 1');
        $html = $this->render('<x-oc::footerbar dark split tall :links="[\'/privacy\' => \'Privacy\', [\'href\' => \'/terms\', \'label\' => \'Terms\']]">© 2026 Company 1</x-oc::footerbar>');
        $this->assertElement($html, 'footer', 'oc-footerbar oc-footerbar--dark oc-footerbar--split oc-footerbar--tall');
        $this->assertElement($html, 'ul', 'oc-footerbar-links');
        $this->assertStringContainsString('<span>© 2026 Company 1</span>', $html);
        $this->assertStringContainsString('<a href="/terms">Terms</a>', $html);
    }

    public function test_tag_list(): void
    {
        $html = $this->render('<x-oc::tag-list neutral size="lg" aria-label="Brands" :items="[\'Brand 1\', \'Brand 2\']" />');
        $this->assertElement($html, 'ul', 'oc-tag-list oc-tag-list--neutral oc-tag-list--lg', ['aria-label' => 'Brands']);
        $this->assertSame(2, substr_count($html, '<li>'));
    }

    public function test_toc(): void
    {
        $html = $this->render('<x-oc::toc title="On this page" :items="[[\'href\' => \'#a\', \'label\' => \'A\'], [\'href\' => \'#b\', \'label\' => \'B\', \'sub\' => true, \'current\' => true]]" />');
        $this->assertElement($html, 'nav', 'oc-toc', ['aria-label' => 'On this page']);
        $this->assertElement($html, 'p', 'oc-toc-title', [], 'On this page');
        $this->assertElement($html, 'li', 'oc-toc-item--sub');
        $this->assertElement($html, 'a', 'oc-toc-link', ['href' => '#b', 'aria-current' => 'true']);
        $groups = $this->render('<x-oc::toc :groups="[[\'label\' => \'Articles\', \'items\' => [[\'href\' => \'#x\', \'label\' => \'1\']]], [\'label\' => \'Annexes\', \'items\' => [[\'href\' => \'#y\', \'label\' => \'2\']]]]" />');
        $this->assertSame(2, substr_count($groups, 'oc-toc-group-label'));
        $this->assertSame(2, substr_count($groups, '<ul class="oc-toc-list">'));
    }

    public function test_expandable_table_and_show_more(): void
    {
        $html = $this->render('<x-oc::expandable-table :visible="2" :columns="[\'name\' => \'Name\']" :rows="[[\'name\' => \'R1\'], [\'name\' => \'R2\'], [\'name\' => \'R3\']]" />');
        $this->assertElement($html, 'table', 'oc-table-ref');
        $this->assertElement($html, 'tr', 'oc-expandable-table__row-dimmed', [], 'R2');
        $this->assertElement($html, 'tr', 'oc-expandable-table__row-more', [], 'R3');
        $this->assertElement($html, 'div', 'oc-expandable-table__wrap oc-expandable-table__wrap--full');
        $this->assertElement($html, 'label', 'oc-btn oc-btn--secondary oc-expandable-table__trigger');
        $this->assertElement($html, 'input', 'oc-expandable-table__toggle', ['type' => 'checkbox']);

        $more = $this->render('<x-oc::show-more><p>Short</p><x-slot:extra>Extra</x-slot:extra></x-oc::show-more>');
        $this->assertElement($more, 'div', 'oc-showmore__extra', [], 'Extra');
        $this->assertElement($more, 'label', 'oc-btn oc-btn--outline oc-btn--toggle');
    }

    public function test_demo_panel(): void
    {
        $html = $this->render('<x-oc::demo-panel name="v1" code="<button>Save</button>"><button class="oc-btn">Save</button></x-oc::demo-panel>');
        $this->assertElement($html, 'div', 'oc-demo oc-demo--tabs');
        $this->assertSame(2, substr_count($html, 'name="v1"'));
        $this->assertStringContainsString('<pre class="oc-code-window__body"><code>&lt;button&gt;Save&lt;/button&gt;</code></pre>', $html);
        $stacked = $this->render('<x-oc::demo-panel :tabs="false" title="Buttons" tall>x</x-oc::demo-panel>');
        $this->assertElement($stacked, 'div', 'oc-demo');
        $this->assertStringNotContainsString('oc-demo__tablist', $stacked);
        $this->assertElement($stacked, 'div', 'oc-demo__preview oc-demo__preview--tall');
    }

    public function test_product_card(): void
    {
        $html = $this->render('<x-oc::product-card href="#p2" name="Product 2" badge="New" tagline="Quotes" more="Read more" accent="green" fly fly-x="-40px">From quote to invoice.</x-oc::product-card>');
        $this->assertElement($html, 'a', 'oc-product-card oc-reveal--fly oc-accent--green', ['href' => '#p2', 'style' => '--oc-fly-x: -40px']);
        $this->assertElement($html, 'span', 'oc-product-card__badge oc-pill oc-pill--accent', [], 'New');
        $this->assertElement($html, 'p', 'oc-product-card__summary', [], 'From quote to invoice.');
        $this->assertElement($this->render('<x-oc::product-card name="P" />'), 'article', 'oc-product-card');
    }

    public function test_badge_source(): void
    {
        $html = $this->render('<x-oc::badge-source>Component</x-oc::badge-source><x-oc::badge-source kind="file">a.html</x-oc::badge-source><x-oc::badge-source kind="scss">_b.scss</x-oc::badge-source>');
        $this->assertElement($html, 'span', 'oc-badge-source', [], 'Component');
        $this->assertElement($html, 'span', 'oc-badge-source-file', [], 'a.html');
        $this->assertElement($html, 'span', 'oc-badge-source-scss', [], '_b.scss');
    }

    public function test_icon_list(): void
    {
        $this->assertElement($this->render('<x-oc::icon-list :items="[[\'text\' => \'Reports\']]" />'), 'ul', 'oc-icon-list');
        $points = $this->render('<x-oc::icon-list variant="points" accent="violet" :items="[[\'title\' => \'Own server\', \'text\' => \'Data stays.\']]" />');
        $this->assertElement($points, 'ul', 'oc-icon-list oc-icon-list--points');
        $this->assertElement($points, 'span', 'oc-icon-tile oc-icon-tile--sm oc-accent--violet');
        $this->assertElement($points, 'span', 'oc-icon-list__title', [], 'Own server');
        $this->assertElement($this->render('<x-oc::icon-list variant="accent" :items="[\'Drag a shift\']" />'), 'ul', 'oc-list--accent');
    }

    public function test_shot_grid_and_browser_frame_mark(): void
    {
        $html = $this->render('<x-oc::shot-grid min="14rem" :items="[[\'src\' => \'/a.jpg\', \'alt\' => \'A\', \'caption\' => \'Dashboard\'], [\'src\' => \'/b.jpg\', \'alt\' => \'B\', \'href\' => false]]" />');
        $this->assertElement($html, 'div', 'oc-shot-grid', ['style' => '--oc-shot-min: 14rem;']);
        $this->assertSame(2, substr_count($html, '<figure class="oc-shot">'));
        $this->assertSame(1, substr_count($html, '<a href="/a.jpg">'));
        $this->assertStringContainsString('<figcaption>Dashboard</figcaption>', $html);
        $frame = $this->render('<x-oc::browser-frame glow mark="mdi:chart-box-outline" mark-accent="green" src="/a.jpg" />');
        $this->assertElement($frame, 'figure', 'oc-browser-frame oc-browser-frame--glow');
        $this->assertElement($frame, 'span', 'oc-browser-frame__mark oc-icon-tile oc-icon-tile--lg oc-accent--green');
    }

    public function test_disabled_options(): void
    {
        $chips = $this->render('<x-oc::chip-filter name="type" :options="[\'docs\' => [\'label\' => \'Documents\', \'count\' => 0, \'disabled\' => true], \'img\' => \'Images\']" :disabled="[\'img\']" />');
        $this->assertSame(2, substr_count($chips, 'disabled'));
        $this->assertStringContainsString('Documents', $chips);
        $counts = $this->render('<x-oc::filter-counts name="v" :options="[[\'value\' => \'a\', \'label\' => \'A\', \'count\' => 1, \'disabled\' => true]]" />');
        $this->assertElement($counts, 'input', '', ['type' => 'radio', 'disabled' => null]);
        $colors = $this->render('<x-oc::color-select name="c" :options="[\'p\' => [\'Purple\', \'var(--color-purple-50)\', true, \'Purple, in use\'], \'r\' => [\'Red\', \'var(--color-red-70)\']]" />');
        $this->assertElement($colors, 'label', 'oc-color-select-option', ['title' => 'Purple, in use']);
        $this->assertSame(1, substr_count($colors, 'disabled'));
    }

    public function test_sortable_row_grabbed_and_grip_hooks(): void
    {
        $html = $this->render('<table><tbody><x-oc::sortable-row grip="Move Install" :grabbed="true" :grip-attributes="[\'wire:keydown.arrow-up\' => \'up(3)\']"><td>Install</td></x-oc::sortable-row></tbody></table>');
        $this->assertElement($html, 'button', 'oc-sortable-row-grip', ['aria-pressed' => 'true', 'aria-label' => 'Move Install', 'wire:keydown.arrow-up' => 'up(3)']);
        $plain = $this->render('<table><tbody><x-oc::sortable-row><td>x</td></x-oc::sortable-row></tbody></table>');
        $this->assertStringNotContainsString('aria-pressed', $plain);
    }

    public function test_tree_icon_and_actions(): void
    {
        $html = $this->render('<x-oc::tree :items="[[\'label\' => \'Kitchen\', \'icon\' => \'mdi:folder-outline\', \'children\' => [[\'label\' => \'Quote v2.pdf\', \'actions\' => [[\'label\' => \'Rename Quote v2.pdf\', \'text\' => \'Rename\', \'attributes\' => [\'wire:click\' => \'rename(2)\']]]]]]]" />');
        $this->assertElement($html, 'span', 'oc-tree-icon', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'button', 'oc-table-actions-icon', ['aria-label' => 'Rename Quote v2.pdf', 'wire:click' => 'rename(2)'], 'Rename');
        $this->assertElement($html, 'span', 'oc-tree-actions');
    }

    public function test_meter_row_value_slot(): void
    {
        $html = $this->render('<x-oc::meter-row label="Tokens" :percent="40"><x-slot:value><a href="/usage">31k / 50k</a></x-slot:value></x-oc::meter-row>');
        $this->assertStringContainsString('<strong>40%</strong> · <a href="/usage">31k / 50k</a>', $html);
    }

    public function test_timeline_compact(): void
    {
        $html = $this->render('<x-oc::timeline compact :items="[[\'date\' => \'2012\', \'text\' => \'Company founded\']]" />');
        $this->assertStringContainsString('<li><strong>2012</strong><span>Company founded</span></li>', $html);
        $this->assertStringNotContainsString('oc-timeline__item', $html);
    }

    public function test_table_compact_footer_span(): void
    {
        $html = $this->render('<x-oc::table-compact :columns="[\'item\' => \'Item\', \'qty\' => [\'label\' => \'Qty\', \'numeric\' => true], \'price\' => [\'label\' => \'Price\', \'numeric\' => true]]" :rows="[]" :footer="[\'item\' => \'Total\', \'price\' => \'1,325.00\']" :footer-span="2" />');
        $this->assertStringContainsString('<tfoot><tr><td colspan="2">Total</td> <td data-numeric>1,325.00</td> </tr></tfoot>', $html);
    }

    public function test_data_table_badge_cells(): void
    {
        $columns = [['key' => 'name', 'header' => 'Name'], ['key' => 'status', 'header' => 'Status', 'badge' => ['Active' => 'success']], ['key' => 'type', 'header' => 'Type']];
        $rows = [['key' => 'a', 'cells' => ['name' => 'Hinge', 'status' => 'Active', 'type' => ['badge' => 'Deleted', 'variant' => 'secondary']]]];
        $html = $this->render('<x-oc::data-table :columns="$columns" :rows="$rows" />', ['columns' => $columns, 'rows' => $rows]);
        $this->assertElement($html, 'span', 'oc-badge oc-badge--success', [], 'Active');
        $this->assertElement($html, 'span', 'oc-badge oc-badge--secondary', [], 'Deleted');
        $this->assertElement($html, 'td', '', ['data-oc-col' => 'status', 'data-oc-value' => 'Active']);
    }

    public function test_stepper_click_hook(): void
    {
        $html = $this->render('<x-oc::stepper action="goTo" :current="2" :steps="[\'Cart\', \'Address\', [\'label\' => \'Pay\', \'attributes\' => [\'data-x\' => \'1\']]]" />');
        $this->assertElement($html, 'button', 'oc-stepper-item oc-stepper-item--done', ['wire:click' => 'goTo(1)']);
        $this->assertElement($html, 'button', 'oc-stepper-item oc-stepper-item--active', ['wire:click' => 'goTo(2)']);
        $this->assertElement($html, 'button', 'oc-stepper-item', ['data-x' => '1', 'disabled' => null]);
        $this->assertSame(2, substr_count($html, 'wire:click'));
    }

    public function test_alert_dialog_discard(): void
    {
        $html = $this->render('<x-oc::alert-dialog id="unsaved" title="Save?" discard="Don\'t save" :discard-attributes="[\'wire:click\' => \'leave\']">Changes</x-oc::alert-dialog>');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--ghost oc-alert-dialog-discard', ['wire:click' => 'leave', 'command' => 'close', 'commandfor' => 'unsaved']);
        $this->assertLessThan(strpos($html, 'oc-btn oc-btn--outline'), strpos($html, 'oc-alert-dialog-discard'));
    }

    public function test_message_action_hooks(): void
    {
        $html = $this->render('<x-oc::message text="Hi" :actions="[[\'name\' => \'reply\', \'label\' => \'Reply\', \'wire\' => \'reply(5)\'], [\'name\' => \'delete\', \'label\' => \'Delete\', \'destructive\' => true, \'attributes\' => [\'x-on:click\' => \'ask()\']]]" />');
        $this->assertElement($html, 'button', 'oc-message__action', ['aria-label' => 'Reply', 'wire:click' => 'reply(5)']);
        $this->assertElement($html, 'button', 'oc-message__action oc-message__action--destructive', ['aria-label' => 'Delete', 'x-on:click' => 'ask()']);
    }

    public function test_upgrade_banner_dismiss_hook(): void
    {
        $html = $this->render('<x-oc::upgrade-banner title="Free plan" dismiss="hideBanner" dismiss-label="Close" />');
        $this->assertElement($html, 'button', 'oc-upgrade-banner-dismiss', ['wire:click' => 'hideBanner', 'aria-label' => 'Close']);
        $this->assertStringNotContainsString('oc-upgrade-banner-dismiss', $this->render('<x-oc::upgrade-banner title="Free plan" />'));
    }

    public function test_phone_input_dial_binding(): void
    {
        $html = $this->render('<x-oc::phone-input wire:model="phone" dial-model="dial" dial="+31" />');
        $this->assertElement($html, 'select', 'oc-phone-input-dial', ['wire:model' => 'dial', 'name' => 'phone_dial', 'aria-label' => 'Country code']);
        $this->assertElement($html, 'input', 'oc-phone-input-number', ['wire:model' => 'phone']);
        $this->assertStringContainsString('<option value="+31" selected>', $html);
    }

    public function test_slot_fix_leaves_normal_templates_alone(): void
    {
        $compiled = Blade::compileString('<x-oc::callout><x-slot:action>Go</x-slot:action>
Body</x-oc::callout>');
        $this->assertStringNotContainsString('slot end', $compiled);
    }
}

<?php

// File: tests/V0180QpTest.php
// Map: barcode QR -> progress striped + segments, split bar -> severity card compact + calm -> sortable list -> sheet
//      floating / rounded -> otp input block / lg / tiles -> stat list -> save status queued / online / compact ->
//      mode badge staging / offline + env frame -> toast action -> copy field block
// The 0.18.0 wishes for app UIs (QR, split bar, alert rows, sortable list, floating sheet, code input, stat list,
// sync status, environment frame, toast action, copy field block) in Blade.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180QpTest extends TestCase
{
    public function test_barcode_qr_format_and_level(): void
    {
        $html = $this->render('<x-oc::barcode format="QR" level="H" value="https://company1.example/order/1001" />');
        $this->assertElement($html, 'figure', 'oc-barcode oc-barcode--qr', ['data-format' => 'QR', 'data-level' => 'H']);

        $m = $this->render('<x-oc::barcode format="QR" value="CUSTOMER-1" />');
        $this->assertStringNotContainsString('data-level', $m);
        $plain = $this->render('<x-oc::barcode value="5400000000010" />');
        $this->assertStringNotContainsString('oc-barcode--qr', $plain);
    }

    public function test_progress_striped_and_split_bar(): void
    {
        $striped = $this->render('<x-oc::progress :value="3" :max="8" track="striped" label="Stops" />');
        $this->assertElement($striped, 'div', 'oc-progress oc-progress--striped', ['role' => 'progressbar', 'aria-valuemax' => '8']);
        $this->assertStringContainsString('width: 37.5%', $striped);

        $split = $this->render('<x-oc::split-bar legend :segments="[[\'value\' => 12, \'tone\' => \'success\', \'label\' => \'Right\'], [\'value\' => 4, \'tone\' => \'danger\', \'label\' => \'Wrong\'], [\'value\' => 4, \'label\' => \'Open\']]" />');
        $this->assertElement($split, 'div', 'oc-progress oc-progress--split', ['role' => 'img', 'aria-label' => 'Right 12, Wrong 4, Open 4']);
        $this->assertStringContainsString('class="oc-progress-segment oc-progress-segment--success" style="inline-size: 60%"', $split);
        $this->assertStringContainsString('class="oc-progress-segment" style="inline-size: 20%"', $split);
        $this->assertSame(3, substr_count($split, '<li'));

        $max = $this->render('<x-oc::progress :max="20" :segments="[[\'value\' => 9], [\'value\' => 3, \'tone\' => \'warning\']]" />');
        $this->assertStringContainsString('inline-size: 45%', $max);
        $this->assertStringContainsString('inline-size: 15%', $max);
    }

    public function test_severity_card_compact_and_calm(): void
    {
        $html = $this->render('<x-oc::severity-card compact level="calm" title="All teams on route" :tags="[\'Team 1\']">Last check 1 minute ago.</x-oc::severity-card>');
        $this->assertElement($html, 'div', 'oc-severity-card oc-severity-card--calm oc-severity-card--compact');
        $this->assertStringNotContainsString('<details', $html);
        $this->assertStringContainsString('<span class="oc-severity-card-text">Last check 1 minute ago.</span>', $html);
        $this->assertStringContainsString('>Calm</span>', $html);

        $card = $this->render('<x-oc::severity-card level="high" title="Leak">x</x-oc::severity-card>');
        $this->assertStringContainsString('<details', $card);
    }

    public function test_sortable_list(): void
    {
        $html = $this->render('<x-oc::sortable-list ordered arrows name="stops" reorder="reorder" :items="[\'stop-1\' => \'Town hall\', \'stop-2\' => \'Old harbour\']" />');
        $this->assertElement($html, 'ol', 'oc-sortable-list', ['data-oc-sortable' => '', 'data-oc-reorder-call' => 'reorder']);
        $this->assertStringContainsString('data-id="stop-1"', $html);
        $this->assertStringContainsString('aria-label="Move Town hall"', $html);
        $this->assertSame(2, substr_count($html, 'data-oc-move="up"'));
        $this->assertStringContainsString('<input type="hidden" name="stops[]" value="stop-2">', $html);

        $list = $this->render('<x-oc::sortable-list :items="[\'A\', \'B\']" />');
        $this->assertStringContainsString('<ul', $list);
        $this->assertStringContainsString('data-id="A"', $list);
        $this->assertStringNotContainsString('data-oc-move', $list);
    }

    public function test_sheet_floating_and_rounded(): void
    {
        $html = $this->render('<x-oc::sheet id="team" floating title="Team 1">x</x-oc::sheet>');
        $this->assertElement($html, 'dialog', 'oc-sheet oc-sheet--floating');
        $this->assertStringNotContainsString('oc-sheet--inset', $html);
        $bottom = $this->render('<x-oc::sheet id="share" side="bottom" rounded title="Share">x</x-oc::sheet>');
        $this->assertElement($bottom, 'dialog', 'oc-sheet oc-sheet--bottom oc-sheet--rounded');
    }

    public function test_otp_input_block_lg_tiles(): void
    {
        $html = $this->render('<x-oc::otp-input name="team" :length="6" alphanumeric block size="lg" tiles />');
        $this->assertStringContainsString('oc-otp oc-otp--block oc-otp--lg oc-otp--tiles', $html);
        $this->assertSame(1, substr_count($html, '<input'));
    }

    public function test_stat_list(): void
    {
        $html = $this->render('<x-oc::stat-list :items="[[\'label\' => \'Questions\', \'sublabel\' => \'12 of 15 right\', \'value\' => 120]]" :total="[\'label\' => \'Total\', \'value\' => 120]" />');
        $this->assertElement($html, 'dl', 'oc-dl oc-dl--stat');
        $this->assertStringContainsString('<span class="oc-dl-sub">12 of 15 right</span>', $html);
        $this->assertStringContainsString('oc-dl-row oc-dl-row--total', $html);
    }

    public function test_save_status_sync_states(): void
    {
        $queued = $this->render('<x-oc::save-status state="queued" :count="3" />');
        $this->assertStringContainsString('3 changes waiting to sync', $queued);
        $this->assertStringContainsString('oc-status-dot--waiting', $queued);
        $online = $this->render('<x-oc::save-status state="online" />');
        $this->assertStringContainsString('>Online<', $online);
        $compact = $this->render('<x-oc::save-status state="queued" :count="1" compact />');
        $this->assertElement($compact, 'p', 'oc-status oc-status--compact', ['role' => 'status', 'title' => '1 change waiting to sync']);
        $this->assertStringContainsString('<span class="oc-status__count" aria-hidden="true">1</span>', $compact);
        $own = $this->render('<x-oc::save-status state="queued" :count="4" :labels="[\'queued\' => \':count in de wachtrij\']" />');
        $this->assertStringContainsString('4 in de wachtrij', $own);
    }

    public function test_mode_badge_staging_offline_and_env_frame(): void
    {
        $staging = $this->render('<x-oc::mode-badge mode="staging" />');
        $this->assertElement($staging, 'span', 'oc-mode-badge', ['data-mode' => 'staging']);
        $this->assertStringContainsString('Staging', $staging);
        $offline = $this->render('<x-oc::mode-badge mode="offline" offline="Zonder net" />');
        $this->assertStringContainsString('Zonder net', $offline);
        $this->assertStringContainsString('data-mode="offline"', $offline);
        $frame = $this->render('<x-oc::env-frame mode="live" />');
        $this->assertElement($frame, 'div', 'oc-env-frame', ['data-mode' => 'live', 'aria-hidden' => 'true']);
        $contained = $this->render('<x-oc::env-frame mode="staging" contained />');
        $this->assertStringContainsString('oc-env-frame oc-env-frame--contained', $contained);
    }

    public function test_toast_action_label_and_slot(): void
    {
        $label = $this->render('<x-oc::toast variant="success" title="Round published" action="Undo">Teams see it.</x-oc::toast>');
        $this->assertStringContainsString('<button class="oc-toast-action" type="button">Undo</button>', $label);
        $slot = $this->render('<x-oc::toast title="Saved"><x-slot:action><button class="oc-toast-action" type="button" data-x>Undo</button></x-slot:action></x-oc::toast>');
        $this->assertStringContainsString('data-x', $slot);
        $none = $this->render('<x-oc::toast title="Saved" />');
        $this->assertStringNotContainsString('oc-toast-action', $none);
    }

    public function test_copy_field_block(): void
    {
        $html = $this->render('<x-oc::copy-field block value="K7QM2XPA" aria-label="Join code" />');
        $this->assertStringContainsString('oc-copy-field oc-copy-field--block', $html);
    }
}

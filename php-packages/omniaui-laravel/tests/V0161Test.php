<?php

// File: tests/V0161Test.php
// Map: webicon (built-in, Iconify set folder, subset file, label, size, unknown, ratio) -> close button options
//      (sheet, confirm dialog, modal) -> live frame laptop -> card fill

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Omniacss\Laravel\Webicons;

class V0161Test extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Webicons::flush();
    }

    private function iconifyDir(): string
    {
        return dirname(__DIR__, 3).'/node_modules/@iconify-json';
    }

    public function test_webicon_from_the_built_in_set(): void
    {
        config(['omniacss.webicons.path' => sys_get_temp_dir().'/no-iconify-here']);
        $html = $this->render('<x-oc::webicon name="flag:nl-4x3" />');

        $this->assertElement($html, 'svg', 'oc-icon', ['viewbox' => '0 0 640 480', 'width' => '1.3333em', 'height' => '1em', 'data-webicon' => 'flag:nl-4x3', 'aria-hidden' => 'true', 'style' => '--oc-icon-ratio: 1.3333']);
        $this->assertStringContainsString('<path fill="#ae1c28"', $html);
    }

    public function test_webicon_from_the_iconify_sets_with_size_and_label(): void
    {
        config(['omniacss.webicons.path' => $this->iconifyDir()]);
        $html = $this->render('<x-oc::webicon name="mdi:home" size="lg" label="Home <page>" class="text-primary" />');

        $this->assertElement($html, 'svg', 'oc-icon oc-icon--lg text-primary', ['viewbox' => '0 0 24 24', 'fill' => 'currentColor', 'role' => 'img', 'aria-label' => 'Home <page>']);
        $this->assertStringContainsString('<title>Home &lt;page&gt;</title>', $html);
        $this->assertStringNotContainsString('aria-hidden', $html);
        $this->assertStringContainsString('d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"', $html);
    }

    public function test_webicon_from_a_subset_file_first(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'wi').'.json';
        file_put_contents($file, json_encode(['mdi:home' => ['body' => '<path d="M1 1h22"/>', 'width' => 24, 'height' => 24]]));
        config(['omniacss.webicons.files' => [$file], 'omniacss.webicons.path' => $this->iconifyDir()]);

        $this->assertStringContainsString('<path d="M1 1h22"/>', $this->render('<x-oc::webicon name="mdi:home" bare />'));
        $this->assertElement($this->render('<x-oc::webicon name="mdi:home" bare />'), 'svg', '', ['data-webicon' => 'mdi:home', 'width' => '1em']);
    }

    public function test_unknown_webicon_renders_nothing(): void
    {
        config(['omniacss.webicons.path' => $this->iconifyDir()]);
        $this->assertSame('', $this->render('<x-oc::webicon name="mdi:no-such-icon" />'));
        $this->assertSame('', $this->render('<x-oc::webicon name="nope" />'));
    }

    public function test_close_button_options(): void
    {
        $sheet = $this->render('<x-oc::sheet id="f" title="Filters" close-round close-class="my-close">x</x-oc::sheet>');
        $this->assertElement($sheet, 'button', 'oc-sheet-close oc-close--round my-close', ['aria-label' => 'Close']);

        $confirm = $this->render('<x-oc::confirm-dialog id="d" title="Delete?" close-round>Sure?</x-oc::confirm-dialog>');
        $this->assertElement($confirm, 'button', 'oc-alert-dialog-close oc-close--round');

        $this->assertStringNotContainsString('oc-modal-close', $this->render('<x-oc::modal id="m" title="Edit">x</x-oc::modal>'));
        $modal = $this->render('<x-oc::modal id="m" title="Edit" close-round>x</x-oc::modal>');
        $this->assertElement($modal, 'button', 'oc-modal-close oc-close--round', ['commandfor' => 'm', 'command' => 'close']);
    }

    public function test_live_frame_laptop_and_card_fill(): void
    {
        $frame = $this->render('<x-oc::live-frame device="laptop" src="/p" title="Preview" />');
        $this->assertElement($frame, 'div', 'oc-live-frame oc-live-frame--laptop', ['style' => '--oc-live-w: 1440; --oc-live-h: 900']);

        $card = $this->render('<x-oc::card accent="test" fill>Body</x-oc::card>');
        $this->assertElement($card, 'div', 'oc-card oc-card--accent oc-card--fill', ['data-tone' => 'test']);
    }
}

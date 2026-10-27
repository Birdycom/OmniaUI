<?php

// File: tests/ContentAdminTest.php | Map: doc viewer -> cookie consent -> busy overlay -> dark sidebar
// Content and admin Blade components: each renders the same classes and attributes as its snippet.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class ContentAdminTest extends TestCase
{
    public function test_doc_viewer_renders_cards_and_dialogs_wired_with_invoker_commands(): void
    {
        $html = $this->render('<x-oc::doc-viewer id="dv" class="mt-2" />');

        $this->assertElement($html, 'div', 'oc-doc-viewer-grid mt-2');
        $this->assertElement($html, 'figure', 'oc-doc-viewer oc-doc-viewer--video');
        $this->assertStringContainsString('class="oc-doc-viewer__expand" command="show-modal" commandfor="dv-1" aria-label="Open Brochure 2026 full screen"', $html);
        $this->assertStringContainsString('class="oc-doc-viewer__open" command="show-modal" commandfor="dv-2">Click for full screen</button>', $html);
        $this->assertElement($html, 'dialog', 'oc-doc-viewer-dialog', ['id' => 'dv-1', 'closedby' => 'any', 'aria-labelledby' => 'dv-1-title']);
        $this->assertElement($html, 'dialog', 'oc-doc-viewer-dialog oc-doc-viewer-dialog--video', ['id' => 'dv-2']);
        $this->assertStringContainsString('href="#brochure.pdf" download>Download</a>', $html);
        $this->assertStringContainsString('aria-label="Site visit video"', $html);
    }

    public function test_doc_viewer_renders_real_files_and_plain_cards(): void
    {
        $html = $this->render('<x-oc::doc-viewer :items="[[\'label\' => \'Plan\', \'src\' => \'/plan.pdf\'], [\'label\' => \'Clip\', \'src\' => \'/c.mp4\', \'type\' => \'video\', \'fullscreen\' => false]]" />');

        $this->assertStringContainsString('<iframe src="/plan.pdf#toolbar=0&view=FitH" title="Plan" loading="lazy"></iframe>', $html);
        $this->assertStringContainsString('<video src="/c.mp4" controls preload="metadata" aria-label="Clip"></video>', $html);
        $this->assertSame(1, substr_count($html, '<dialog'));
        $this->assertStringNotContainsString('oc-doc-viewer__open', $html);
    }

    public function test_cookie_consent_renders_popover_categories_and_script_once(): void
    {
        $html = $this->render('<x-oc::cookie-consent bar manual /><x-oc::cookie-consent id="second" open-label="" />');

        $this->assertElement($html, 'aside', 'oc-cookie-consent oc-cookie-consent--bar', ['id' => 'oc-cookie-consent', 'popover' => 'manual', 'data-oc-consent-manual' => null]);
        $this->assertStringContainsString('<button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-consent-open>Cookie settings</button>', $html);
        $this->assertStringContainsString('name="necessary" checked disabled aria-label="Necessary cookies"', $html);
        $this->assertStringContainsString('name="statistics" aria-label="Statistics cookies"', $html);
        $this->assertStringContainsString('data-oc-consent="all">Accept all</button>', $html);
        $this->assertStringContainsString('<a href="#cookie-policy">cookie policy</a>', $html);
        $this->assertSame(1, substr_count($html, 'data-oc-consent-open>'));
        $this->assertSame(1, substr_count($html, '<script>'));
    }

    public function test_busy_overlay_renders_spinner_or_progress(): void
    {
        $html = $this->render('<x-oc::busy-overlay id="busy" title="Uploading" />');

        $this->assertElement($html, 'dialog', 'oc-busy-overlay', ['id' => 'busy', 'closedby' => 'none', 'aria-labelledby' => 'busy-title', 'aria-describedby' => 'busy-text']);
        $this->assertStringContainsString('<span class="oc-spinner" role="status" aria-label="Busy"></span>', $html);
        $this->assertStringContainsString('<h2 class="oc-busy-overlay__title" id="busy-title">Uploading</h2>', $html);
        $this->assertStringContainsString('dataset?.ocBusy', $html);

        $progress = $this->render('<x-oc::busy-overlay id="p" :progress="40" />');
        $this->assertStringContainsString('style="width: 40%"', $progress);
        $this->assertStringNotContainsString('oc-spinner', $progress);
    }

    public function test_sidebar_dark_modifier(): void
    {
        $html = $this->render('<x-oc::sidebar dark>Items</x-oc::sidebar>');

        $this->assertElement($html, 'aside', 'oc-sidebar oc-sidebar--dark');
    }

}

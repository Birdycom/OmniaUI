<?php

// File: tests/WidgetTest.php
// Map: status-dot + status -> glass -> titlebar -> progress meter (levels, marker) -> alert/button inline -> prose compact
// Widget and desktop-app components (0.12.3): Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class WidgetTest extends TestCase
{
    public function test_status_dot_and_row(): void
    {
        $html = $this->render('<x-oc::status-dot tone="error" size="lg" label="Failed" /><x-oc::status tone="done" meta="12 min">Done</x-oc::status>');

        $this->assertElement($html, 'span', 'oc-status-dot oc-status-dot--error oc-status-dot--lg', ['role' => 'img', 'aria-label' => 'Failed']);
        $this->assertElement($html, 'p', 'oc-status');
        $this->assertElement($html, 'span', 'oc-status-dot oc-status-dot--done', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'span', 'oc-status__meta', [], '12 min');
    }

    public function test_glass_sheet_and_panel(): void
    {
        $html = $this->render('<x-oc::glass as="section" flat><x-oc::glass-panel strong>x</x-oc::glass-panel></x-oc::glass>');

        $this->assertElement($html, 'section', 'oc-glass oc-glass--flat');
        $this->assertElement($html, 'div', 'oc-glass-panel oc-glass-panel--strong', [], 'x');
    }

    public function test_titlebar_with_button(): void
    {
        $html = $this->render('<x-oc::titlebar title="App" subtitle="Usage" bordered size="sm"><x-oc::titlebar-button label="Close" close>x</x-oc::titlebar-button></x-oc::titlebar><x-oc::titlebar-body>body</x-oc::titlebar-body>');

        $this->assertElement($html, 'header', 'oc-titlebar oc-titlebar--bordered oc-titlebar--sm');
        $this->assertElement($html, 'span', 'oc-titlebar__subtitle', [], 'Usage');
        $this->assertElement($html, 'button', 'oc-titlebar__btn oc-titlebar__btn--close', ['aria-label' => 'Close', 'type' => 'button']);
        $this->assertElement($html, 'div', 'oc-titlebar-body', [], 'body');
    }

    public function test_progress_levels_and_marker(): void
    {
        $html = $this->render('<x-oc::progress :value="38" :max="50" size="sm" glow levels :marker="10" />');

        $this->assertElement($html, 'div', 'oc-progress oc-progress--sm oc-progress--glow');
        $this->assertElement($html, 'div', 'oc-progress-bar oc-progress-bar--warning');
        $this->assertStringContainsString('class="oc-progress-marker" style="left: 20%"', $html);

        $fixed = $this->render('<x-oc::progress :value="95" levels variant="success" />');
        $this->assertElement($fixed, 'div', 'oc-progress-bar oc-progress-bar--success');
    }

    public function test_inline_alert_button_and_compact_prose(): void
    {
        $html = $this->render('<x-oc::alert variant="danger" inline>Wrong</x-oc::alert><x-oc::button variant="link" inline>Reset</x-oc::button><x-oc::prose size="compact"><p>x</p></x-oc::prose>');

        $this->assertElement($html, 'div', 'oc-alert oc-alert--danger oc-alert--inline');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--link oc-btn--inline');
        $this->assertElement($html, 'article', 'oc-prose oc-prose--compact');
    }
}

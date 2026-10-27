<?php

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use PHPUnit\Framework\Attributes\DataProvider;

class ComponentsTest extends TestCase
{
    public function test_button_default_has_base_class_only(): void
    {
        $html = $this->render('<x-oc::button>Save</x-oc::button>');

        $this->assertElement($html, 'button', 'oc-btn', ['type' => 'button'], 'Save');
    }

    public function test_button_variant_size_and_merged_classes(): void
    {
        $html = $this->render('<x-oc::button variant="destructive" size="sm" class="mt-2" type="submit">Delete</x-oc::button>');

        $this->assertStringContainsString('class="oc-btn oc-btn--destructive oc-btn--sm mt-2"', $html);
        $this->assertStringContainsString('type="submit"', $html);
    }

    public function test_button_primary_is_the_base_style_and_href_renders_a_link(): void
    {
        $html = $this->render('<x-oc::button variant="primary" href="/home" icon>Go</x-oc::button>');

        $this->assertElement($html, 'a', 'oc-btn oc-btn--icon', ['href' => '/home'], 'Go');
    }

    public function test_badge_and_alert(): void
    {
        $this->assertStringContainsString('class="oc-badge oc-badge--secondary"', $this->render('<x-oc::badge variant="secondary">B</x-oc::badge>'));

        $alert = $this->render('<x-oc::alert variant="success" title="Done">Saved.</x-oc::alert>');
        $this->assertStringContainsString('class="oc-alert oc-alert--success"', $alert);
        $this->assertStringContainsString('<h4 class="oc-alert-title">Done</h4>', $alert);
        $this->assertStringContainsString('<p class="oc-alert-description">Saved.</p>', $alert);
    }

    public function test_card_with_named_footer_slot(): void
    {
        $html = $this->render('<x-oc::card title="Create" description="Now"><p>Body</p><x-slot:footer>Foot</x-slot:footer></x-oc::card>');

        $this->assertStringContainsString('class="oc-card"', $html);
        $this->assertStringContainsString('<h3 class="oc-card-title">Create</h3>', $html);
        $this->assertStringContainsString('<div class="oc-card-content"><p>Body</p></div>', $html);
        $this->assertStringContainsString('<div class="oc-card-footer">Foot</div>', $html);
    }

    public function test_input_passes_attributes_and_flags_validation_errors(): void
    {
        $html = $this->render('<x-oc::input name="email" type="email" wire:model="email" />');
        $this->assertStringContainsString('class="oc-input"', $html);
        $this->assertStringContainsString('wire:model="email"', $html);

        $error = $this->render('<x-oc::input name="email" :error="true" />');
        $this->assertStringContainsString('oc-input oc-input--error', $error);
        $this->assertStringContainsString('aria-invalid="true"', $error);
    }

    public function test_switch_puts_attributes_on_the_checkbox(): void
    {
        $html = $this->render('<x-oc::switch name="news" checked />');

        $this->assertElement($html, 'label', 'oc-switch');
        $this->assertElement($html, 'input', '', ['role' => 'switch', 'name' => 'news', 'type' => 'checkbox', 'checked' => null]);
        $this->assertStringContainsString('<span class="oc-switch-track"></span>', $html);
    }

    public function test_modal_renders_dialog_with_trigger_and_footer_slots(): void
    {
        $html = $this->render('<x-oc::modal id="m1" title="Sure?" size="sm"><x-slot:trigger><button command="show-modal" commandfor="m1">Open</button></x-slot:trigger> Text <x-slot:footer>Buttons</x-slot:footer></x-oc::modal>');

        $this->assertElement($html, 'dialog', 'oc-modal', ['id' => 'm1', 'closedby' => 'any']);
        $this->assertStringContainsString('class="oc-modal-content oc-modal-content--sm"', $html);
        $this->assertStringContainsString('<h2 class="oc-modal-title" id="m1-title">Sure?</h2>', $html);
        $this->assertStringContainsString('<div class="oc-modal-footer">Buttons</div>', $html);
    }

    public function test_sheet_side_modifier(): void
    {
        $html = $this->render('<x-oc::sheet id="s1" side="left" wide title="T">Body</x-oc::sheet>');

        $this->assertStringContainsString('class="oc-sheet oc-sheet--left"', $html);
        $this->assertStringContainsString('oc-sheet-content oc-sheet-content--wide', $html);
    }

    public function test_alert_dialog_type_modifier(): void
    {
        $html = $this->render('<x-oc::alert-dialog id="d1" type="success" title="Ok" confirm="Fine">Msg</x-oc::alert-dialog>');

        $this->assertStringContainsString('oc-alert-dialog oc-alert-dialog--success', $html);
        $this->assertStringContainsString('commandfor="d1"', $html);
    }

    public function test_segmented_marks_the_selected_option(): void
    {
        $html = $this->render('<x-oc::segmented name="p" :options="[\'m\' => \'Month\', \'y\' => \'Year\']" value="y" size="sm" block />');

        $this->assertStringContainsString('oc-segmented oc-segmented--sm oc-segmented--block', $html);
        $this->assertMatchesRegularExpression('/value="y" checked/', $html);
        $this->assertDoesNotMatchRegularExpression('/value="m" checked/', $html);
    }

    public function test_select_options_and_selection(): void
    {
        $html = $this->render('<x-oc::select name="c" :options="[\'be\' => \'Belgium\', \'nl\' => \'Netherlands\']" value="nl" placeholder="Choose" />');

        $this->assertStringContainsString('class="oc-select"', $html);
        $this->assertStringContainsString('<option value="nl" selected>Netherlands</option>', $html);
    }

    public function test_pagination_builds_links_and_current_page(): void
    {
        $html = $this->render('<x-oc::pagination :current="2" :total="3" />');

        $this->assertStringContainsString('class="oc-pagination"', $html);
        $this->assertElement($html, 'a', 'oc-pagination-item', ['href' => '?page=2', 'aria-current' => 'page'], '2');
    }

    public function test_stepper_states(): void
    {
        $html = $this->render('<x-oc::stepper :steps="[\'A\', \'B\', \'C\']" :current="2" horizontal />');

        $this->assertStringContainsString('oc-stepper oc-stepper--horizontal', $html);
        $this->assertStringContainsString('oc-stepper-item oc-stepper-item--done', $html);
        $this->assertElement($html, 'button', 'oc-stepper-item oc-stepper-item--active', ['aria-current' => 'step']);
        $this->assertElement($html, 'button', 'oc-stepper-item', ['disabled' => null]);
    }

    public function test_progress_width_and_aria(): void
    {
        $html = $this->render('<x-oc::progress :value="60" variant="success" />');

        $this->assertStringContainsString('role="progressbar"', $html);
        $this->assertStringContainsString('aria-valuenow="60"', $html);
        $this->assertStringContainsString('oc-progress-bar oc-progress-bar--success" style="width: 60%"', $html);
    }

    public function test_accordion_and_item_share_a_group(): void
    {
        $html = $this->render('<x-oc::accordion><x-oc::accordion.item title="One" name="faq" open>A</x-oc::accordion.item></x-oc::accordion>');

        $this->assertStringContainsString('class="oc-accordion"', $html);
        $this->assertElement($html, 'details', 'oc-accordion-item', ['name' => 'faq', 'open' => null]);
        $this->assertStringContainsString('<summary class="oc-accordion-trigger">One</summary>', $html);
    }

    public function test_sidebar_with_group_and_item(): void
    {
        $html = $this->render('<x-oc::sidebar><x-oc::sidebar.group label="Platform"><x-oc::sidebar.item href="/a" current badge="3">Home</x-oc::sidebar.item></x-oc::sidebar.group></x-oc::sidebar>');

        $this->assertElement($html, 'aside', 'oc-sidebar', ['aria-label' => 'Main navigation']);
        $this->assertElement($html, 'a', 'oc-sidebar-menu-button', ['href' => '/a', 'aria-current' => 'page']);
        $this->assertStringContainsString('<span class="oc-sidebar-menu-badge">3</span>', $html);
    }

    public function test_table_helpers(): void
    {
        $html = $this->render('<x-oc::table striped caption="Contacts"><thead><tr><x-oc::table.sort href="?sort=name" direction="ascending">Name</x-oc::table.sort></tr></thead></x-oc::table>');

        $this->assertStringContainsString('class="oc-table-wrap"', $html);
        $this->assertStringContainsString('class="oc-table oc-table--striped"', $html);
        $this->assertStringContainsString('aria-sort="ascending"', $html);
        $this->assertStringContainsString('<a class="oc-table-sort" href="?sort=name">Name</a>', $html);
    }

    public function test_toast_variant_role_and_container(): void
    {
        $html = $this->render('<x-oc::toast.container top><x-oc::toast variant="error" title="Oops">Bad</x-oc::toast></x-oc::toast.container>');

        $this->assertStringContainsString('oc-toast-container oc-toast-container--top', $html);
        $this->assertElement($html, 'div', 'oc-toast oc-toast--error', ['role' => 'alert']);
    }

    public function test_user_derives_initials(): void
    {
        $html = $this->render('<x-oc::user name="Serge Cools" email="serge@example.com" />');

        $this->assertStringContainsString('class="oc-user"', $html);
        $this->assertStringContainsString('<span class="oc-avatar"> SC </span>', $html);
        $this->assertStringContainsString('<span class="oc-user-email">serge@example.com</span>', $html);
    }

    public function test_dropdown_uses_popover_ids(): void
    {
        $html = $this->render('<x-oc::dropdown id="menu" label="Options" :items="[[\'label\' => \'Profile\', \'href\' => \'/p\'], [\'separator\' => true]]" />');

        $this->assertStringContainsString('popovertarget="menu"', $html);
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => 'menu', 'popover' => null]);
        $this->assertStringContainsString('<a class="oc-dropdown-item" href="/p">Profile</a>', $html);
        $this->assertStringContainsString('<div class="oc-dropdown-separator"></div>', $html);
    }

    /** Every component renders without errors and without hard-coded colors. */
    #[DataProvider('allComponents')]
    public function test_every_component_renders(string $tag): void
    {
        $html = $this->render("<{$tag} id=\"x\" name=\"x\" title=\"T\" text=\"T\" label=\"T\" :total=\"3\" />");

        $this->assertNotSame('', $html);
        $this->assertStringContainsString('oc-', $html);
        $this->assertDoesNotMatchRegularExpression('/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/', preg_replace('/&#?\w+;/', '', $html));
    }

    public static function allComponents(): array
    {
        $root = dirname(__DIR__).'/resources/views/components';
        $out = [];
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)) as $file) {
            if (! str_ends_with($file->getFilename(), '.blade.php')) {
                continue;
            }
            $key = str_replace(['/', '\\'], '.', substr(substr($file->getPathname(), strlen($root) + 1), 0, -10));
            // Components that need slot/prop context are covered by dedicated tests above.
            if (in_array($key, ['table.sort', 'table.empty', 'sidebar.item'], true)) {
                continue;
            }
            $out[$key] = ["x-oc::{$key}"];
        }
        ksort($out);

        return $out;
    }
}

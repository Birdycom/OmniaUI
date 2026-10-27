<?php

// File: tests/ChatTest.php | Map: attachment (chip, list, image, thumb) -> message (+ list, divider) -> message thread -> prose
//   -> chart line (paths equal the snippet)
// Chat and content Blade components: each renders the same classes and attributes as its snippet.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class ChatTest extends TestCase
{
    public function test_attachment_chip_derives_type_and_icon_from_the_name(): void
    {
        $html = $this->render('<x-oc::attachment name="Plan.xlsx" size="86 KB" href="#p" />');

        $this->assertElement($html, 'a', 'oc-attachment oc-attachment--sheet', ['href' => '#p', 'download' => null]);
        $this->assertStringContainsString('<span class="oc-attachment__icon" aria-hidden="true">XLS</span>', $html);
        $this->assertStringContainsString('<span class="oc-attachment__size">86 KB</span>', $html);
    }

    public function test_attachment_states_and_remove_button(): void
    {
        $up = $this->render('<x-oc::attachment name="Note.pdf" state="uploading" :progress="65" removable />');
        $this->assertElement($up, 'div', 'oc-attachment oc-attachment--pdf oc-attachment--uploading', ['style' => '--oc-attachment-progress:65%']);
        $this->assertStringContainsString('<span class="oc-attachment__size" role="status">Uploading… 65%</span>', $up);
        $this->assertStringContainsString('aria-label="Cancel upload of Note.pdf"', $up);

        $err = $this->render('<x-oc::attachment name="IMG_2048.heic" size="Larger than 25 MB" state="error" removable />');
        $this->assertElement($err, 'div', 'oc-attachment oc-attachment--image oc-attachment--error');
        $this->assertStringContainsString('>HEIC</span>', $err);
        $this->assertStringContainsString('aria-label="Remove IMG_2048.heic"', $err);
    }

    public function test_attachment_list_image_and_thumb(): void
    {
        $list = $this->render('<x-oc::attachment.list stack />');
        $this->assertElement($list, 'ul', 'oc-attachment-list oc-attachment-list--stack', ['aria-label' => 'Files in this message']);
        $this->assertSame(4, substr_count($list, '<li> <a '));
        $this->assertElement($list, 'a', 'oc-attachment oc-attachment--zip', ['href' => '#plans.zip', 'download' => null]);

        $image = $this->render('<x-oc::attachment.image href="#s.jpg" alt="Sample" :art="6" caption="s.jpg · 2.1 MB" />');
        $this->assertStringContainsString('<span class="oc-media-art oc-media-art--6" role="img" aria-label="Sample"></span>', $image);

        $thumb = $this->render('<x-oc::attachment.thumb alt="Shot" remove-label="Remove shot.png" />');
        $this->assertElement($thumb, 'div', 'oc-attachment-thumb');
        $this->assertStringContainsString('aria-label="Remove shot.png"', $thumb);
    }

    public function test_message_renders_quote_status_and_actions(): void
    {
        $html = $this->render('<x-oc::message direction="out" avatar="TP" time="09:20" datetime="2026-10-14T09:20" status="read" status-icon continued label="You, 09:20"
            :quote="[\'href\' => \'#q\', \'sender\' => \'Lisa\', \'text\' => \'Which?\']" text="Calacatta." :actions="[[\'name\' => \'reply\', \'label\' => \'Reply\']]" />');

        $this->assertElement($html, 'article', 'oc-message oc-message--out oc-message--continued', ['aria-label' => 'You, 09:20']);
        $this->assertStringContainsString('<a class="oc-message__quote" href="#q"><strong>Lisa</strong><span>Which?</span></a>', $html);
        $this->assertStringContainsString('<p class="oc-message__meta"><time datetime="2026-10-14T09:20">09:20</time><span class="oc-message__status oc-message__status--read"><svg', $html);
        $this->assertElement($html, 'button', 'oc-message__action', ['aria-label' => 'Reply']);
    }

    public function test_message_list_demo_has_dividers_and_attachment_kinds(): void
    {
        $html = $this->render('<x-oc::message.list />');
        $this->assertElement($html, 'div', 'oc-message-list', ['role' => 'log', 'aria-label' => 'Conversation with Lisa Verbeke']);
        $this->assertStringContainsString('<div class="oc-message-divider oc-message-divider--system" role="note"><span>Lisa Verbeke marked this question as answered</span></div>', $html);
        $this->assertStringContainsString('id="oc-message-demo-question"', $html);

        $thumbs = $this->render('<x-oc::message avatar="SC" :attachments="[[\'kind\' => \'thumb\', \'alt\' => \'Tile\', \'art\' => 4]]" />');
        $this->assertStringContainsString('<div class="oc-message__attachments"> <div class="oc-attachment-list"> <span class="oc-attachment-thumb">', $thumbs);
    }

    public function test_message_thread_renders_header_composer_overlay_and_script_once(): void
    {
        $html = $this->render('<x-oc::message-thread id="t" busy /><x-oc::message-thread id="u" note="Closed" busy-title="" :menu="[]" :status="[]" />');

        $this->assertElement($html, 'section', 'oc-message-thread', ['aria-labelledby' => 't-title', 'aria-busy' => 'true']);
        $this->assertStringContainsString('popovertarget="t-menu" aria-label="Conversation actions"', $html);
        $this->assertStringContainsString('<span class="oc-avatar" title="Lisa Verbeke">LV</span>', $html);
        $this->assertStringContainsString('<textarea class="oc-chat-composer__input" id="t-input" name="message" rows="1" placeholder="Type your reply…" required></textarea>', $html);
        $this->assertStringContainsString('<p class="oc-message-thread__note">Closed</p>', $html);
        $this->assertSame(1, substr_count($html, 'oc-message-thread__busy'));
        $this->assertSame(1, substr_count($html, '<script>'));
    }

    public function test_prose_renders_the_demo_and_size_modifier(): void
    {
        $html = $this->render('<x-oc::prose size="lg" />');
        $this->assertElement($html, 'article', 'oc-prose oc-prose--lg');
        $this->assertStringContainsString('<p class="oc-prose-lead">', $html);

        $this->assertStringContainsString('<div class="oc-prose oc-prose--full"> <p>Own</p> </div>', $this->render('<x-oc::prose as="div" full><p>Own</p></x-oc::prose>'));
    }

    public function test_chart_line_paths_equal_the_snippet(): void
    {
        $html = $this->render('<x-oc::chart-line />');
        preg_match_all('/class="oc-chart-line__path" d="([^"]+)"/', file_get_contents(dirname(__DIR__, 3).'/packages/ui/snippets/chart-line.html'), $expected);

        $this->assertElement($html, 'figure', 'oc-chart-line oc-chart-line--dots');
        foreach ($expected[1] as $d) {
            $this->assertStringContainsString('<path class="oc-chart-line__path" d="'.$d.'"/>', $html);
        }
        $this->assertStringContainsString('<li>320</li><li>240</li><li>160</li><li>80</li><li>0</li>', $html);
        $this->assertStringContainsString('aria-label="January: Desktop 186, Mobile 80"><i class="oc-chart-line__dot" style="--y:58.13%"></i><i class="oc-chart-line__dot" style="--y:25%"></i>', $html);
        $this->assertStringContainsString('<li>Jan</li>', $html);
    }

}

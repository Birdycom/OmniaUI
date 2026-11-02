<?php

namespace Omniacss\Laravel\Tests;

// Shop components: rating, rating-input, price, quantity, gallery, stock, spec-list, ribbon.
class ShopTest extends TestCase
{
    public function test_rating_shows_score_and_label(): void
    {
        $html = $this->render('<x-oc::rating :value="4.5" size="sm" />');

        $this->assertStringContainsString('class="oc-rating oc-rating--sm"', $html);
        $this->assertStringContainsString('--oc-rating: 4.5', $html);
        $this->assertStringContainsString('aria-label="4.5 out of 5"', $html);
    }

    public function test_rating_input_checks_the_value(): void
    {
        $html = $this->render('<x-oc::rating-input name="score" :value="4" />');

        $this->assertSame(5, substr_count($html, 'type="radio" name="score"'));
        $this->assertStringContainsString('value="4" checked', $html);
        $this->assertStringContainsString('<span>1 star</span>', $html);
    }

    public function test_price_formats_numbers_and_shows_old_price(): void
    {
        $html = $this->render('<x-oc::price :amount="119" :old="149" discount="-20%" note="incl. VAT" sale />');

        $this->assertStringContainsString('oc-price--sale', $html);
        $this->assertMatchesRegularExpression('/oc-price__amount">[^<]*119,00/u', $html);
        $this->assertMatchesRegularExpression('/oc-price__old">[^<]*149,00/u', $html);
        $this->assertStringContainsString('<span class="oc-badge oc-badge--destructive">-20%</span>', $html);
    }

    public function test_quantity_has_step_buttons_and_limits(): void
    {
        $html = $this->render('<x-oc::quantity name="qty" :value="2" :min="1" :max="9" size="sm" />');

        $this->assertStringContainsString('class="oc-quantity oc-quantity--sm"', $html);
        $this->assertStringContainsString('data-oc-step="-1"', $html);
        $this->assertStringContainsString('data-oc-step="1"', $html);
        $this->assertStringContainsString('name="qty"', $html);
        $this->assertStringContainsString('min="1"', $html);
        $this->assertStringContainsString('max="9"', $html);
    }

    public function test_gallery_renders_slides_and_thumbnails(): void
    {
        $html = $this->render('<x-oc::gallery :images="$images" side />', ['images' => [
            ['src' => '/a.svg', 'alt' => 'Front'],
            ['src' => '/b.svg', 'alt' => 'Side'],
        ]]);

        $this->assertStringContainsString('class="oc-gallery oc-gallery--side"', $html);
        $this->assertSame(2, substr_count($html, 'class="oc-gallery__slide"'));
        $this->assertSame(2, substr_count($html, 'class="oc-gallery__thumb"'));
        $this->assertSame(1, substr_count($html, 'checked'));
    }

    public function test_ribbon_corner_tone_and_size(): void
    {
        $this->assertStringContainsString('<span class="oc-ribbon">New</span>', $this->render('<x-oc::ribbon>New</x-oc::ribbon>'));
        $this->assertStringContainsString('class="oc-ribbon oc-ribbon--top-start oc-ribbon--success oc-ribbon--lg">Paid', $this->render('<x-oc::ribbon corner="top-start" tone="success" size="lg">Paid</x-oc::ribbon>'));
    }

    public function test_stock_default_text_and_level(): void
    {
        $this->assertStringContainsString('>In stock<', $this->render('<x-oc::stock />'));
        $low = $this->render('<x-oc::stock level="low" note="3 left">Only 3 left</x-oc::stock>');
        $this->assertStringContainsString('data-level="low"', $low);
        $this->assertStringContainsString('Only 3 left', $low);
        $this->assertStringContainsString('oc-stock__note', $low);
    }

    public function test_spec_list_groups_and_rows(): void
    {
        $html = $this->render('<x-oc::spec-list :groups="$groups" />', ['groups' => [
            ['title' => 'Dimensions', 'rows' => [['label' => 'Height', 'value' => '52 cm'], ['label' => 'Lamp', 'value' => 'E27', 'note' => 'max. 40 W']]],
        ]]);

        $this->assertStringContainsString('<h3 class="oc-spec-group__title">Dimensions</h3>', $html);
        $this->assertSame(2, substr_count($html, 'class="oc-spec-row"'));
        $this->assertStringContainsString('<small>max. 40 W</small>', $html);
    }
}

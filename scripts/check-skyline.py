"""Exercise the SVG syntax changes that could alter the shared footer artwork."""
from decimal import Decimal as D
from pathlib import Path
import re
import unittest
from compact_skyline import canonical_path, compact_path, compact_svg


class SkylineCompactionTests(unittest.TestCase):
    def test_relative_moveto_and_close_reset(self):
        self.assertEqual(canonical_path('m10 20 5 6 h7 v8 z m1 2 l-3-4'), (
            ('M', (D(10), D(20))), ('L', (D(15), D(26))),
            ('H', (D(22),)), ('V', (D(34),)), ('Z', ()),
            ('M', (D(11), D(22))), ('L', (D(8), D(18))),
        ))

    def test_curve_control_points_and_arc_flags(self):
        data = 'M100 100 c1 2 3 4 5 6 s7 8 9 10 q-1-2-3-4 t5 6 a10 20 30 1 0 40-50'
        expected = 'M100 100 C101 102 103 104 105 106 S112 114 114 116 Q113 114 111 112 T116 118 A10 20 30 1 0 156 68'
        self.assertEqual(canonical_path(data), canonical_path(expected))
        self.assertEqual(canonical_path(compact_path(data)), canonical_path(expected))

    def test_decimal_precision_and_repeated_commands(self):
        data = 'M1000.0001 2000.0002 L1000.0002 2000.0004 L1000.0003 2000.0006 Z'
        compact = compact_path(data)
        self.assertLess(len(compact), len(data))
        self.assertEqual(canonical_path(compact), canonical_path(data))
        self.assertEqual(compact_path(compact), compact)

    def test_preserve_structure_and_animation_hooks(self):
        svg = '<svg viewBox="0 0 100 100" aria-hidden="true">\n<g class="sk-plane" transform="translate(1 2)"><path id="sk-route" d="M10.0 20.0 L11.0 22.0 L12.0 24.0"/></g>\n</svg>'
        compact = compact_svg(svg)
        self.assertIn('class="sk-plane" transform="translate(1 2)"', compact)
        self.assertIn('id="sk-route"', compact)
        self.assertIn('aria-hidden="true"', compact)
        self.assertEqual(compact_svg(compact), compact)

    def test_actual_artwork_is_idempotent(self):
        home = (Path(__file__).resolve().parents[1] / 'index.html').read_text()
        svg = re.search(r'<svg class="skyline sky3"[\s\S]*?</svg>', home).group()
        self.assertEqual(compact_svg(svg), svg)


if __name__ == '__main__':
    unittest.main()

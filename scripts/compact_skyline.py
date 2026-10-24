"""Losslessly shorten the portfolio skyline's SVG path encoding.

Coordinates use Decimal arithmetic. No path commands, nodes, IDs, classes,
transforms, accessibility attributes or geometric values are removed/rounded.
Only equivalent absolute/relative syntax and redundant separators change.
"""
from decimal import Decimal, localcontext
import re
import xml.etree.ElementTree as ET

TOKEN = re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?')
ARITY = dict(M=2, L=2, H=1, V=1, C=6, S=4, Q=4, T=2, A=7)
PATH = re.compile(r'\bd="([^"]*)"')


def tokens(data):
    values = []
    end = 0
    for match in TOKEN.finditer(data):
        if data[end:match.start()].strip(' \t\r\n,'):
            raise ValueError('Unsupported SVG path syntax')
        values.append(match.group())
        end = match.end()
    if data[end:].strip(' \t\r\n,'):
        raise ValueError('Invalid SVG path suffix')
    return values


def precision(parts):
    numbers = [Decimal(p) for p in parts if not p.isalpha()]
    return max(80, max((p.adjusted() for p in numbers), default=0)
               - min((p.as_tuple().exponent for p in numbers), default=0) + 10)


def endpoint(command, params, current, start):
    if command == 'Z':
        return start
    if command == 'H':
        return params[0], current[1]
    if command == 'V':
        return current[0], params[0]
    return params[-2], params[-1]


def translate(command, params, current, sign):
    result = list(params)
    if command == 'H':
        result[0] += sign * current[0]
    elif command == 'V':
        result[0] += sign * current[1]
    elif command == 'A':
        result[-2] += sign * current[0]
        result[-1] += sign * current[1]
    else:
        for i in range(0, len(result), 2):
            result[i] += sign * current[0]
            result[i + 1] += sign * current[1]
    return tuple(result)


def canonical_path(data):
    parts = tokens(data)
    with localcontext() as context:
        context.prec = precision(parts)
        records = []
        current = start = (Decimal(0), Decimal(0))
        active = None
        i = 0
        while i < len(parts):
            if parts[i].isalpha():
                active = parts[i]
                i += 1
                if active.upper() == 'Z':
                    records.append(('Z', ()))
                    current = start
                    active = None
                    continue
            if active is None:
                raise ValueError('Path parameters need an active command')
            command = active.upper()
            size = ARITY[command]
            raw = parts[i:i + size]
            if len(raw) != size or any(p.isalpha() for p in raw):
                raise ValueError('Incomplete SVG path command')
            params = tuple(Decimal(p) for p in raw)
            if command == 'A' and any(p not in (0, 1) for p in params[3:5]):
                raise ValueError('Invalid SVG arc flags')
            if active.islower():
                params = translate(command, params, current, 1)
            records.append((command, params))
            current = endpoint(command, params, current, start)
            if command == 'M':
                start = current
                active = 'l' if active.islower() else 'L'
            i += size
        return tuple(records)


def number(value):
    if value == 0:
        return '0'
    value = format(value, 'f')
    if '.' in value:
        value = value.rstrip('0').rstrip('.')
    if value.startswith('0.'):
        value = value[1:]
    elif value.startswith('-0.'):
        value = '-' + value[2:]
    return value


def parameters(values):
    result = ''
    for value in values:
        value = number(value)
        if result and value[0] not in '+-':
            result += ' '
        result += value
    return result


def compact_path(data):
    records = canonical_path(data)
    with localcontext() as context:
        context.prec = precision(tokens(data))
        result = ''
        active = None
        current = start = (Decimal(0), Decimal(0))
        for command, values in records:
            if command == 'Z':
                result += 'z'
                current = start
                active = None
                continue
            options = []
            for symbol, params in [(command, values),
                                   (command.lower(), translate(command, values, current, -1))]:
                prefix = '' if symbol == active and command != 'M' else symbol
                encoded = parameters(params)
                if not prefix and result and encoded[0] not in '+-':
                    prefix = ' '
                options.append((prefix + encoded, symbol))
            encoded, symbol = min(options, key=lambda p: len(p[0]))
            result += encoded
            current = endpoint(command, values, current, start)
            if command == 'M':
                start = current
                active = 'l' if symbol.islower() else 'L'
            else:
                active = symbol
    if canonical_path(result) != records:
        raise ValueError('SVG geometry changed during compaction')
    return result if len(result) < len(data) else data


def compact_svg(svg):
    result = PATH.sub(lambda m: 'd="' + compact_path(m[1]) + '"', svg)
    result = re.sub(r'>\s+<', '><', result)
    before = list(ET.fromstring(svg).iter())
    after = list(ET.fromstring(result).iter())
    if len(before) != len(after):
        raise ValueError('SVG structure changed')
    for old, new in zip(before, after):
        old_attrs, new_attrs = dict(old.attrib), dict(new.attrib)
        old_path, new_path = old_attrs.pop('d', None), new_attrs.pop('d', None)
        if old.tag != new.tag or old_attrs != new_attrs:
            raise ValueError('SVG attributes, styling hooks or accessibility changed')
        if (old.text or '').strip() != (new.text or '').strip():
            raise ValueError('SVG text changed')
        if old_path is not None and canonical_path(old_path) != canonical_path(new_path):
            raise ValueError('SVG path geometry changed')
    return result

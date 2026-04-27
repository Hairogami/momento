#!/usr/bin/env python3
"""
Convert hardcoded fontSize: <num> in inline styles to fluid CSS vars.

Mapping (px -> token):
  6,7,8,9,10  -> var(--text-2xs)   (10-12px)
  11,12       -> var(--text-xs)    (12-14px)
  13,14       -> var(--text-sm)    (13-16px)
  15,16       -> var(--text-base)  (15-18px)
  17,18,19,20 -> var(--text-md)    (16-20px)
  21-24       -> var(--text-lg)    (18-24px)
  25-32       -> var(--text-xl)    (22-32px)
  33-44       -> var(--text-2xl)   (28-44px)
  45-60       -> var(--text-3xl)   (36-60px)
  >=61        -> var(--text-4xl)   (44-80px)
"""

import re
import sys
from pathlib import Path

def map_size(n: int) -> str:
    if n <= 10: return "var(--text-2xs)"
    if n <= 12: return "var(--text-xs)"
    if n <= 14: return "var(--text-sm)"
    if n <= 16: return "var(--text-base)"
    if n <= 20: return "var(--text-md)"
    if n <= 24: return "var(--text-lg)"
    if n <= 32: return "var(--text-xl)"
    if n <= 44: return "var(--text-2xl)"
    if n <= 60: return "var(--text-3xl)"
    return "var(--text-4xl)"

PAT_NUM = re.compile(r"fontSize:\s*(\d+)(?=[,\s\}\)])")
PAT_STR = re.compile(r"fontSize:\s*['\"](\d+)(?:px)?['\"]")

def convert(content):
    count = [0]
    def repl_num(m):
        n = int(m.group(1))
        count[0] += 1
        return f'fontSize: "{map_size(n)}"'
    def repl_str(m):
        n = int(m.group(1))
        count[0] += 1
        return f'fontSize: "{map_size(n)}"'
    out = PAT_NUM.sub(repl_num, content)
    out = PAT_STR.sub(repl_str, out)
    return out, count[0]

if __name__ == "__main__":
    files = sys.argv[1:]
    if not files:
        print("Usage: fluid_type.py <file1> [file2 ...]")
        sys.exit(1)
    total = 0
    for f in files:
        p = Path(f)
        if not p.exists():
            print(f"SKIP (not found): {f}")
            continue
        src = p.read_text(encoding="utf-8")
        out, n = convert(src)
        if n > 0:
            p.write_text(out, encoding="utf-8")
        print(f"  {n:4d}  {f}")
        total += n
    print(f"\nTotal: {total} replacements")

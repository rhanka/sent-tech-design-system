<!--
  Synthetic round-trip corpus for RT-0 (RED 2 core half).
  Provenance: synthetic, authored for this lot. Never the qualified real dossier.
  Covers every P0 construct (plain, bold, italic, inline-code and hard-break
  paragraphs, emphasis marker variants, two textually identical paragraphs,
  accents/emoji) and every preserved construct (heading, table, fenced code,
  list, image, raw HTML), with preserved blocks interleaved between editable
  paragraphs so the editing half has surroundings to preserve.
  The two "CRLF paragraph" stanzas below are separated by CRLF line endings
  (bytes 0x0D 0x0A); the rest of the file uses LF. Ends with trailing blank
  lines and a final newline.
-->

# Preserved heading one: the editor keeps this slice byte-identical

A plain editable paragraph introducing the corpus.

A paragraph with **bold**, *italic* and `inline code` together.

A paragraph with underscore markers: __strong__, _emphasis_ and `code`.

The quick brown fox jumps over the lazy dog.

The quick brown fox jumps over the lazy dog.

Accents and emoji travel untouched: café, naïve, façade 🎉🚀.

A hard break follows inside this paragraph:  
this line continues after the hard break.

| Preserved | Table |
| --- | --- |
| one | two |

```
preserved code fence
second fence line
```

- preserved bullet one
- preserved bullet two

Middle paragraph kept for the editing half: the harness edits this line only.

CRLF paragraph one.

CRLF paragraph two with *italic*.

![preserved image](preserved.png)

<div class="preserved">raw HTML stays verbatim</div>

A closing editable paragraph after the preserved blocks.



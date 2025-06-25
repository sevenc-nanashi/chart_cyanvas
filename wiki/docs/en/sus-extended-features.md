# Extended SUS features

:::warning
We currently recommend using USC.
These specifications are kept for compatibility.
:::

## #REQUEST "side\_lane true"

For compatibility, lanes `0`\~`1`, `e`\~`f` (and greater) are ignored by default.

```
#REQUEST "side_lane true"
```

You can add this line to your SUS file to enable these lanes.

## #REQUEST "lane\_offset \<number>"

Shift lanes to the right by `<number>`.

## Notes ID 3 (FLICK Notes)

If they are not placed on slide midpoints, they are parsed as **Trace Notes**.

Trace Notes can be activated by simply placing your finger on them (ref: Drag notes in Phigros).

You can use upper AIR (Directional notes with ID 1, 3, or 4) to add flick, and lower AIR (Directional notes with ID 2) to hide the arrow.

You can make them critical by adding Notes ID 2 (ExTap Notes).

## Trace slides

You can make slides respond without tapping by adding Notes ID 3 (FLICK Notes) to the slide start and/or end points.

## Notes ID 5 (DAMAGE Notes)

As the name suggests, touching them will result in a MISS judgment.

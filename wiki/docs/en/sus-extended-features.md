# Extended SUS Features

:::warning
We currently recommend using USC.
These specifications are kept for compatibility.
:::

## #REQUEST `"side_lane true"`

For compatibility, lanes `0` to `1` and `e` to `f` (and greater) are ignored by default.

```
#REQUEST "side_lane true"
```

You can add this line to your SUS file to enable these lanes.

## #REQUEST `"lane_offset <number>"`

Shifts lanes to the right by `<number>`.

## Note ID 3 (Flick Notes)

If they are not placed on slide midpoints, they are parsed as **Trace Notes**.

Trace Notes can be activated by simply placing your finger on them (ref: Drag notes in Phigros).

You can use upper AIR (Directional notes with ID 1, 3, or 4) to add a flick, and lower AIR (Directional notes with ID 2) to hide the arrow.

You can make them critical by adding Note ID 2 (ExTap Notes).

## Trace Slides

You can make slides respond without tapping by adding Note ID 3 (Flick Notes) to the slide start and/or end points.

## Note ID 5 (Damage Notes)

As the name suggests, touching them will result in a MISS judgment.

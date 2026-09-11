---
# Claude Design の Design System ペインでコンポーネントを並べる表示グループ。
# Storybook のタイトルは「コンポーネント/<Name>」で、converter はタイトルの上位階層を
# [a-z0-9] に丸めてグループ名にするため、日本語だと空になり misc に落ちる。
# frontmatter の category が converter 公式のグループ上書き手段なので、
# config.json の docsMap で全コンポーネントからこのファイルを指している。
# 本文は必ず空のままにすること（本文を書くと全コンポーネントの .prompt.md に差し込まれる）。
category: component
---

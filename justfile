default:
    @just --list

check:
    bun run typecheck
    bun run test
    bun run lint
    bun run check:design
    bun run build
    bun run build-storybook

# DESIGN.md の colors を tokens/tokens.css から再生成する。
# `just check` が差分を検出したらこれを実行する。
sync-design:
    bun run sync:design

build:
    bun run build

# package release前に、利用側を模した環境でもbuildできることを確認する。
verify-package:
    bun run verify:package

typecheck:
    bun run typecheck

test:
    bun run test

lint:
    bun run lint

format:
    bun run format

storybook:
    bun run storybook

build-storybook:
    bun run build-storybook

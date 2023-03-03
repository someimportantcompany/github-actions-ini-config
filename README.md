# ini-config

[![GitHub](https://badge.fury.io/gh/someimportantcompany%2Fgithub-actions-ini-config.svg)](https://github.com/someimportantcompany/github-actions-ini-config)
[![CICD](https://github.com/someimportantcompany/github-actions-ini-config/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/someimportantcompany/github-actions-ini-config/actions?query=workflow%3ACI)
[![Coverage](https://coveralls.io/repos/github/someimportantcompany/github-actions-ini-config/badge.svg)](https://coveralls.io/github/someimportantcompany/github-actions-ini-config)

Given an ini-style configuration block, parse the contents & assign relevant environment variables / output in your GitHub Workflow.

## Usage

```yml
- uses: someimportantcompany/github-actions-ini-config@v1
  id: config
  with:
    config: |
      ; Defaults, applied on each run
      [env]
      SOMETHING = true
      [outputs]
      stage = dev

      ; Production config
      [(${{ github.ref == "refs/heads/main" }}).env]
      NODE_ENV = production
      [(${{ github.ref == "refs/heads/main" }}).outputs]
      branch = main
      stage = prod

      ; Development config
      [(${{ github.ref == "refs/heads/develop" }}).env]
      NODE_ENV = development
      [(${{ github.ref == "refs/heads/develop" }}).outputs]
      branch = develop
      stage = dev

      ; Other config
      [(${{ github.ref == "refs/heads/release/v1" }}).outputs]
      branch = release/v1
      stage = release

# if github.ref == "refs/heads/main"
- run: echo ${{ env.NODE_ENV }} # production
- run: echo ${{ steps.config.outputs.branch }} # develop
- run: echo ${{ steps.config.outputs.stage }} # prod

# if github.ref == "refs/heads/develop"
- run: echo ${{ env.NODE_ENV }} # development
- run: echo ${{ steps.config.outputs.branch }} # develop
- run: echo ${{ steps.config.outputs.stage }} # dev

# if github.ref == "refs/heads/release/v1"
- run: echo ${{ env.NODE_ENV }} # null
- run: echo ${{ steps.config.outputs.branch }} # release/v1
- run: echo ${{ steps.config.outputs.stage }} # release

# if github.ref == "refs/heads/feature/something"
- run: echo ${{ env.NODE_ENV }} # null
- run: echo ${{ steps.config.outputs.branch }} # null
- run: echo ${{ steps.config.outputs.stage }} # dev
```

## Inputs

Key | Description
---- | ----
`config` | **Required**. An ini-style configuration block to parse.

### Syntax

```
[(${{ /* Workflow Expression */ }}).$section]
```

Provide a suitable GitHub Workflow between the brackets `()`, and choose either `env` or `outputs` for the section. This gives you the full range of [expressions](https://docs.github.com/en/actions/learn-github-actions/expressions), [contexts](https://docs.github.com/en/actions/learn-github-actions/contexts) & [variables](https://docs.github.com/en/actions/learn-github-actions/variables).

## Notes

- Any questions or suggestions [please open an issue](https://github.com/someimportantcompany/github-actions-ini-config/issues).

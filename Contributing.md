# Contributing

## Shell helpers

For this repo we have a few zsh shell helpers that are used to make development easier.
To make use of them you can add the following to your `.zshrc` file in your preferred way.

```zsh
autoload -U add-zsh-hook

function load_aliases() {
  [ -f ./.aliases ] && [ "$PWD" != "$HOME" ] && source ./.aliases
}

load_aliases
add-zsh-hook chpwd load_aliases

```

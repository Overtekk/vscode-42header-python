<img
  src="https://raw.githubusercontent.com/kube/vscode-42header/master/42.png"
  width=128>

> **THIS PROJECT IS A FORK.**
>
> This project is a fork from the vscode-42header from [kube](https://github.com/kube/vscode-42header)


# 42 Header for VSCode

This extension provides the 42 header integration in VS Code for Python.
Because the old header can't be put due to flake8, I changed it to a mini-header.

```bash
# ************************************************************************* #
#                                                                           #
#                                                      :::      ::::::::    #
# vscode.py                                          :+:      :+:    :+:    #
#                                                  +:+ +:+         +:+      #
# By: roandrie <roandrie@student.42.fr>          +#+  +:+       +#+         #
#                                              +#+#+#+#+#+   +#+            #
# Created: 2026/01/19 08:57:15 by roandrie         #+#    #+#               #
# Updated: 2026/01/19 09:18:37 by roandrie         ###   ########.fr        #
#                                                                           #
# ************************************************************************* #
```

## Install

Launch Quick Open with <kbd>⌘</kbd>+<kbd>P</kbd> and enter
```
ext install 42headerpython
```

## Usage

### Insert a header
 - **macOS** : <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>H</kbd>
 - **Linux** / **Windows** : <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>H</kbd>.

Header is automatically updated on save.


## Configuration

Default values for **username** and **email** are imported from environment variables.

To override these values, specify these properties in *User Settings* :

```ts
{
  "42headerpython.username": string,
  "42headerpython.email": string
}
```


## Issues

In case of a bug, or missing feature, please create a [Github Pull Request](https://github.com/Overtekk/vscode-42header-python/pulls).

## License

MIT

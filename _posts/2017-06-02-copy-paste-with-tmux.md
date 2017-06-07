---
layout: post
title: "Copiar y Pegar con tmux"
date: 2012-05-22
excerpt: "Una breve guia sobre como copio y pego con tmux"
tags: [terminal, gnu-linux]
comments: true
---

Me estreno en este blog con un artículo sobre como copio y pego en tmux, un multiplexor de terminales. Soy un enamorado del editor de texto VIM así que trato de mantener las aplicaciones que más empleo en terminal lo más estandarizadas posibles con el modo de funcionar de VIM. En el futuro iré publicando posts sobre distintos aspectos de VIM pero quería empezar por contar como copio y pego con tmux, algo que probablemente sea lo menos intuitivo de este multiplexor.

## Configurar tmux

Tmux dispone de una estupenda página de manual ({% highlight bash %} man txux {% endhighlight %}) y una opción como *mode-keys vi* que permite definir un comportamiento similar a VIM durante el copy-mode de tmux.

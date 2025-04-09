---
layout: post
title:  "Markdownの書き方"
date:   1977-10-31
excerpt: "Just about everything you'll need to style in the theme: headings, paragraphs, blockquotes, tables, code blocks, and more."
tag:
- 内部向け資料
comments: true
---

## HTML Elements

Below is just about everything you'll need to style in the theme. Check the source code to see the many embedded elements within paragraphs.

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

### Body text

Lorem ipsum dolor sit amet, test link adipiscing elit. **This is strong**. Nullam dignissim convallis est. Quisque aliquam.

![Smithsonian Image]({{ site.url }}/assets/img/placeholder-big.jpg)
{: .image-right}

*This is emphasized*. Donec faucibus. Nunc iaculis suscipit dui. 53 = 125. Water is H2O. Nam sit amet sem. Aliquam libero nisi, imperdiet at, tincidunt nec, gravida vehicula, nisl. The New York Times (That’s a citation). Underline.Maecenas ornare tortor. Donec sed tellus eget sapien fringilla nonummy. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus.

HTML and CSS are our tools. Mauris a ante. Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus. Praesent mattis, massa quis luctus fermentum, turpis mi volutpat justo, eu volutpat enim diam eget metus.

### Blockquotes

> Lorem ipsum dolor sit amet, test link adipiscing elit. Nullam dignissim convallis est. Quisque aliquam.

## List Types

### Ordered Lists

1. Item one
   1. sub item one
   2. sub item two
   3. sub item three
2. Item two

### Unordered Lists

* Item one
* Item two
* Item three

## Tables

### 通常のテーブル

#### ヘッダーあり

```
| Header1 | Header2 | Header3 |
| :------ | :-----: | ------: |
| cell1   |  cell2  |   cell3 |
| cell4   |  cell5  |   cell6 |
| ----    |
| cell1   |  cell2  |   cell3 |
| cell4   |  cell5  |   cell6 |
| =====   |
| Foot1   |  Foot2  |   Foot3 |

```

| Header1 | Header2 | Header3 |
| :------ | :-----: | ------: |
| cell1   |  cell2  |   cell3 |
| cell4   |  cell5  |   cell6 |
| ----    |
| cell1   |  cell2  |   cell3 |
| cell4   |  cell5  |   cell6 |
| =====   |
| Foot1   |  Foot2  |   Foot3 |

#### ヘッダー無し

```
|:--------|:-------:|--------:|
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
```

|:--------|:-------:|--------:|
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |

### キーバリューテーブル

#### ヘッダーなし
```
|--------:|:-------|
| key1   | value1   |
| key2   | value2   |
{: .keyvalue}
```

|--------:|:-------|
| key1   | value1   |
| key2   | value2   |
{: .keyvalue}


#### ヘッダーあり

````
| Key     | Value   |
|--------:|:-------|
| key1   | value1   |
| key2   | value2   |
{: .keyvalue}
````

| Key     | Value   |
|--------:|:-------|
| key1   | value1   |
| key2   | value2   |
{: .keyvalue}


## Code Snippets

{% highlight css %}
#container {
  float: left;
  margin: 0 -240px 0 0;
  width: 100%;
}
{% endhighlight %}

## Buttons

Make any link standout more when applying the `.btn` class.

{% highlight html %}
<a href="#" class="btn btn-success">Success Button</a>
{% endhighlight %}

<div markdown="0"><a href="#" class="btn">Primary Button</a></div>
<div markdown="0"><a href="#" class="btn btn-success">Success Button</a></div>
<div markdown="0"><a href="#" class="btn btn-warning">Warning Button</a></div>
<div markdown="0"><a href="#" class="btn btn-danger">Danger Button</a></div>
<div markdown="0"><a href="#" class="btn btn-info">Info Button</a></div>

## KBD

You can also use `<kbd>` tag for keyboard buttons.

{% highlight html %}
<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
{% endhighlight %}

Press <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to move your car. **Midtown Maddness!!**

## Notices

**Watch out!** You can also add notices by appending `{: .notice}` to a paragraph.
{: .notice}


## Images

<figure>
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像一つだけ掲載する例</figcaption>
</figure>

----

<figure class="half">
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像２つを横並びにする例</figcaption>
</figure>

----

<figure class="third">
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像３つを横並びにする例</figcaption>
</figure>

## MathJax

Here is an example MathJax inline rendering \\( 1/x^{2} \\), and here is a block rendering: 

----

\\[ \frac{1}{n^{2}} \\]

----

$$
\begin{align*}
  & \phi(x,y) = \phi \left(\sum_{i=1}^n x_ie_i, \sum_{j=1}^n y_je_j \right)
  = \sum_{i=1}^n \sum_{j=1}^n x_i y_j \phi(e_i, e_j) = \\
  & (x_1, \ldots, x_n) \left( \begin{array}{ccc}
      \phi(e_1, e_1) & \cdots & \phi(e_1, e_n) \\
      \vdots & \ddots & \vdots \\
      \phi(e_n, e_1) & \cdots & \phi(e_n, e_n)
    \end{array} \right)
  \left( \begin{array}{c}
      y_1 \\
      \vdots \\
      y_n
    \end{array} \right)
\end{align*}
$$
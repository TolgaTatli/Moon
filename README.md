# 横山研Webページ管理の手引き

* 事前知識（各リンクを読んで周辺知識を身に着けてください）
  * **このREADME.mdも含めて全てパブリック領域なので非公開情報は置かない事！** 
  * このページはGitHub上でWebページをホスティングする機能[GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages)を利用しています。
  * CMSやblog的なページを静的なサイトで実現する[Jekyll](http://jekyllrb-ja.github.io/)環境で作成されています。
  * 各ページは'''_post'''ディレクトリに格納される[Markdowns](https://gist.github.com/mignonstyle/083c9e1651d7734f84c99b8cf49d57fa)ファイルで記述します。
  * Jekyllはテンプレートエンジンである[Liquid](https://shopify.github.io/liquid/)を利用していますので、その機能が使えます。
  * 全体デザインは[Moon Jekyll Theme](https://github.com/TaylanTatli/Moon)をforkしてページを作っています。

----

> **重要！**　ページを編集する前に、必ず**ページの構成**と**タグの付け方**を読んでください

## 更新方法

* **更新は必ずブランチを作成し、それを更新してください。**
* ブランチ名は適切に付けてください。
* 変更が終わったらPull Requestを送ってください。
* Pull RequestはWeb係(+横山)が精査してコミットします。
* 単ページの一部の文言変更など、コミット前のプレビューが必要無いケースでは、ブラウザでブランチを作り更新しプルリクを送ると良いでしょう
  * https://github.com/YokoyamaLab/newwebpage/branches
* 手元のマシンで更新中のサイトのプレビューをしたい場合は[Jekyll](http://jekyllrb-ja.github.io/)をインストールする必要があります
## ページの構成

* すべてのページは```_post```ディレクトリ内に```2022-08-01-ipsj-siggi.md```のような、『日付、内容が分かる端的な名前』からなるファイル名を付ける必要が有ります。サブディレクトリ分けはせず、```_post```直下におきましょう。
* ページに属する画像は```assets/img```の下に適切な(どの記事の写真か分かる名前の)サブディレクトリを作成し格納してください。
* サイトの構造として、トップページの下に、全体を***About***、***Members***、***Posts***、***Projects***の４カテゴリに分けています。各ページもそれらのどれかに属していなければいけません。(ページ上部のヘッダの書き方でどのカテゴリに属するかがJekyllによってに判断され、適切に配置されます)

### About

* 研究室についての概要説明のページです。このカテゴリに所属しているページは、ページ中のメッセージの所に並びます。基本的に更新や追加の必要は無いです。
* Aboutページにサブページを追加するには以下の記載をMarkdownのページ冒頭に記してください。ただしtagsは後述するタグの解説を読み正しくつけてください。titleとexcerptはAboutページに自動で貼られるリンクのタイトルと概要になります。
* ヘッダの**comment**を**true**にするとページ下部にコメント欄が現れます。

```
---
layout: post
title:  "外部からの受験希望者へ"
date:   2018-04-01
excerpt: "外部受験希望者向けのFAQをまとめています。問い合わせる前に必ず読んでください。"
about: true
tag:
- 研究室情報
- 留学生
comments: false
---
```

### Members

* 研究室のメンバ紹介のページです。毎年年度初めにページを追加します。年度中にメンバーの変化が有った場合は当該年度のファイルを更新してください。
* 年度毎に追加するファイルの日付は各年度の4月1日にしておいてください。またファイル名は「2022-04-01-our-members-2022.md」に準拠して命名してください。
* 追加するページの冒頭に以下を技術してください。titleは「2022年度 横山研」に準拠してください。excerptには前年度との違いを簡潔に書いてください。
* ファイルの中身は前年度のものを踏襲してください。
* ヘッダの**comment**を**true**にするとページ下部にコメント欄が現れます。

```
---
layout: post
title: "2022年度 横山研"
excerpt: "本年度、新たに学部生５名が加わりました。"
author: "Naoki Kitamura"
date:   2022-04-01
members: true
feature: assets/img/members/members2022.png
tags: 
 - 2022年度
 - 研究室
 - メンバー
comments: false
---
```

### Posts

* 研究室イベントの紹介や、研究会・国際会議などの参加報告等のページを追加します。ブログ的に使います。何か話題が発生した時点で、ページを追加します。
* 基本的には学会発表等に参加したら１ページ書きましょう。研究の事だけでなく、学会の雰囲気や出会った美味しいものなども書いてOKです。その他研究室の飲み会やスポーツ大会のイベントなども紹介してください。学生の表彰もここに載せます。
* タグは考えて付けましょう。タグ別にページ一覧を作成する機能がありますが、適当にタグを付けると分類の意味をなさなくなります。タグについては次章で説明します。
* ヘッダの**comment**を**true**にするとページ下部にコメント欄が現れます。

```
---
layout: post
title:  "横山研公式Webリニューアル"
excerpt: "横山研のWebページをリニューアルしました。"
tag:
- 2022年度
- お知らせ
- ホームページ
comments: false
---
```

### Projects

* 研究内容についての概要を紹介するページです。不定期で各メンバーが取り組んでいる研究を一般向けに分かりやすく紹介するページを作ります。研究発表が終わったタイミングなどで追加していきます。
* ブログ的なPostと異なり、こちらには研究内容を伝えるために使います。特に新しいトピックで発表した場合は、論文の概要をここに書きます。
* 中村研＠明治大学のサイトが非常に参考になると思います。
  * https://nkmr-lab.org/news/deim2022_indecisive_komatsubara.html
* ページリストは新しいものが上に来るように自動的に一覧が制作されますが、「横山研の研究概要」のみ最上段にピン止めされています。ここには、全休全体の概要を書きます。これは数年に一度を目安に更新します。
* 新しい研究ネタを追加するには以下のヘッダを利用してMarkdownを記述し_postに追加します。
* タグには「年度」と「研究」を含めてください、また5Gかソーシャルビッグデータのどちらかのタグを付与してください。それ以上の細分化したタグは随時検討し必要なら追加してください。
* ヘッダの**comment**を**true**にするとページ下部にコメント欄が現れます。

```
---
layout: post
title:  "横山研の研究概要"
excerpt: "今取り組んでいる研究の全体像を分かりやすく説明します。"
project: true
pinned: true
tag:
- 2022年度
- 研究
- 5G
- ソーシャルビッグデータ
comments: false
---
```
----

## タグについて

* 各ページにはヘッダでタグを付ける事が出来ます。それにより、[タグによるページの分類](https://tmu.yokoyama.ac/newwebpage/tags/)が自動的に行えます。
* なので、タグの付与は、一定のルールを決めてそれに基づいて付与する事で、この索引を意味あるものにします。
* 必要に応じて追加してください。ただしかならずこのページの情報を更新してください。

### Members内の投稿について
* 「2022年度」など投稿年度のタグを付与してください。
* 「研究室」と「メンバー」のタグを必ず付与してください。
### Posts内の投稿について

Postsのページのタグは適当に付けると後々乱雑になって整理ができなくなるので、慎重に付けてください。ここのルールを読むとともに、類似した以前のイベントの記事を参照して、付与するタグを決めてください。
* 「2022年度」など投稿年度のタグを付与してください。
* 記事のタイプを以下から選んでタグとして付与してください。（必要なら新設してかまいませんが、かならずこのページも更新してください。）
  * ** 日記  **: イベント参加の報告など
  * ** お知らせ **: 研究室からのお知らせ（学生受賞やイベント紹介など）
* 記事の内容を以下から選んで付けてください。（複数可、これも適宜追加してください。）
  * ** 出張報告 **: 学会発表などどこかに出かけて発表した時に記録
  * ** コンパ **: 新歓、追いコン、忘年会など
  * ** スポーツ**: スポーツ大会など
  * ** ホームページ **: このホームページに関する話題
  * ** 研究室 **: 研究室に新しい機会がやってきたなど
* **出張報告**の時は内容に応じて以下のタグも追加で付与してください。(当てはまらない出張は何もつけなくてOKです)
  * ** 国内研究会 **: 国内での学会発表等
  * ** 国際会議 **: 国内で開催される国際会議もこのタグを付けてください。
  * ** ゼミ合宿 **: 他大等と合同で合宿をした時はこのタグです
  * ** フィールドワーク **: あまり無いかもしれませんが学外で実験をおこなった記録など
* **学会参加の場合は学会名のタグも作ってください**
  * 例えば**MEDE2022**に参加した場合は**年を削除**して**MEDES**というタグにしましょう。
  * **DEIM**、**ゲーム情報学研究会**、
* **学会参加の場合は開催地のタグを作ってください**
  * 日本国内の場合：都道府県名 eg.**神奈川県**、**香川県**
  * 国外の場合：国名 eg.**フランス**、**ドイツ**、**アメリカ**
### Projects内の投稿について

* 「2022年度」など投稿年度のタグを付与してください。
* 「研究」のタグを必ず付与してください。
* 発表に関する話題の場合は「発表」のタグを必ず付けてください。
* 発表方法が「国際会議」か「論文誌」か「国内研究会」か、適切なものを付けてください。
* 研究分野が「5G」か「ソーシャルビッグデータ」かをえらくでください。


## Markdownの書き方

* [Markdowns](https://gist.github.com/mignonstyle/083c9e1651d7734f84c99b8cf49d57fa)の書き方は全て有効です。その上で、利用しているテンプレートが提供する以下の機能が使えます。
* 加えて、このテンプレート特有の書き方もありますので、以下の説明を一読してください。
* 以下ページの説明に基づいたページサンプルは[こちら](syntax-sample/)をご覧ください。


###　テーブルの作り方

```
| Header1 | Header2 | Header3 |
|:--------|:-------:|--------:|
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
|----
| cell1   | cell2   | cell3   |
| cell4   | cell5   | cell6   |
|=====
| Foot1   | Foot2   | Foot3
```  


### キーボードのキーの表示

* WASDのキーを表示する例
  
```html
<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
```

### コードスニペット

* コードスニペットはMarkdown標準のものも使えますが、独自のCSSを適用させるため以下のコードを使ってください。
* [対応する言語のリスト](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)

```css
{% highlight css %}
#container {
    float: left;
    margin: 0 -240px 0 0;
    width: 100%;
}
{% endhighlight %}
```

### リンクをボタン風にする

* aタグにclassに設定する事で対応可能です。(文中の場合はdivタグは必要ありません)

```html
<div markdown="0"><a href="#" class="btn">白いボタン</a></div>
<div markdown="0"><a href="#" class="btn btn-success">緑のボタン</a></div>
<div markdown="0"><a href="#" class="btn btn-warning">オレンジのボタン</a></div>
<div markdown="0"><a href="#" class="btn btn-danger">赤いボタン</a></div>
<div markdown="0"><a href="#" class="btn btn-info">青いボタン</a></div>
```

### 文章を囲む

* 文章に続いて```{: .notice}```と記述するとその段落が罫線で囲まれます。NoticeやWarningメッセージ用ですが、強調用途で使えます。

```markdown
**Watch out!** You can also add notices by appending `{: .notice}` to a paragraph.
{: .notice}
```

### 画像を綺麗に入れる

* 画像を記事に入れるには```<figure>```タグを使います。
* 画像は[```assets/img```](assets/img/)ディレクトリ内に格納してください。
* Markdownから参照する時は```{{  site.url }}/```を前に加えて絶対パスにするのを忘れずに。
#### 画像１つ

``` html
<figure>
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像一つだけ掲載する例</figcaption>
</figure>
```

#### 画像２つ

``` html
<figure class="half">
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像２つを横並びにする例</figcaption>
</figure>
```

#### 画像３つ

``` html
<figure class="third">
	<img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
  <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
	<figcaption>画像３つを横並びにする例</figcaption>
</figure>
```

#### 動画を埋め込む

* 動画を記事に入れるには、Youtube公式の埋め込みコードが使えます。レスポンシブにはならないので注意してください。

``` html
<iframe width="560" height="315" src="//www.youtube.com/embed/SU3kYxJmWuQ" frameborder="0"> </iframe>
```

#### 数式を入れる

* [MathJax](http://www.mathjax.org/) を使ってTeX形式で数式を表現できます。


```
Here is an example MathJax inline rendering \\( 1/x^{2} \\), and here is a block rendering: 
\\[ \frac{1}{n^{2}} \\]
```

* ここでエスケープが```\\}```な事に注意してください。
* なお、複雑な数式も書くことができます。

```
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
```
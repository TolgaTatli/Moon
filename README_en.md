# Guide for Managing Yokoyama Lab's Website

* **Prerequisites** (Please read the following links to gain background knowledge)
  * **Do not place any confidential information here as this README.md and all related files are in a public domain!**
  * This website is hosted using [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).
  * The site is built using [Jekyll](http://jekyllrb.com/), which enables static websites to function like CMS or blogs.
  * Each page is written in [Markdown](https://gist.github.com/mignonstyle/083c9e1651d7734f84c99b8cf49d57fa) and stored in the `_posts` directory.
  * Jekyll uses the [Liquid](https://shopify.github.io/liquid/) template engine, which you can utilize for advanced features.
  * The overall design is based on the [Moon Jekyll Theme](https://github.com/TaylanTatli/Moon), which has been forked and customized for this site.

----

> **Important!** Before editing the website, make sure to read **Page Structure** and **Tagging Guidelines**.

## How to Update

* **Always create a new branch for updates.**
* Name the branch appropriately.
* After making changes, submit a Pull Request.
* Pull Requests will be reviewed and committed by the web admin (+ Yokoyama).
* For minor edits, such as text changes on a single page, you can create a branch and submit a Pull Request directly from the browser:
  * https://github.com/YokoyamaLab/newwebpage/branches
* To preview the site locally during updates, you need to install [Jekyll](http://jekyllrb.com/).

## Page Structure

* All pages must be stored directly under the `_posts` directory with a filename like `2022-08-01-ipsj-siggi.md`, which includes the date and a concise description of the content.
* Images for pages should be stored in the `assets/img` directory under a subdirectory with a descriptive name indicating the related article.
* The site is structured into four main categories: ***About***, ***Members***, ***Posts***, and ***Projects***. Each page must belong to one of these categories. The category is determined by the header in the Markdown file, which Jekyll uses to place the page appropriately.

### About

* Pages in this category provide an overview of the lab. These pages appear in the "About" section of the site and typically do not require frequent updates.
* To add a subpage to the About section, include the following header at the beginning of the Markdown file. Ensure the tags are correctly assigned based on the tagging guidelines. The `title` and `excerpt` fields will be used for the link title and summary on the About page.
* Setting `comments` to `true` will enable a comment section at the bottom of the page.

```markdown
---
layout: post
title:  "For Prospective Students"
date:   2018-04-01
excerpt: "FAQs for prospective students. Please read before contacting us."
about: true
tag:
- Lab Information
- International Students
comments: false
---
```

### Members

* This category introduces lab members. A new page should be added at the beginning of each academic year. If there are changes in members during the year, update the corresponding year's file.
* The date for new files should be set to April 1 of the respective year, and filenames should follow the format `2022-04-01-our-members-2022.md`.
* Use the following header for new pages. The `title` should follow the format "Yokoyama Lab 2022". The `excerpt` should briefly describe changes from the previous year.
* The content of the file should follow the format of the previous year's file.
* Setting `comments` to `true` will enable a comment section at the bottom of the page.

```markdown
---
layout: post
title: "Yokoyama Lab 2022"
excerpt: "This year, five new undergraduate students have joined."
author: "Naoki Kitamura"
date:   2022-04-01
members: true
feature: assets/img/members/members2022.png
tags: 
 - 2022
 - Lab
 - Members
comments: false
---
```

## How to Write Markdown

* All [Markdown syntax](https://gist.github.com/mignonstyle/083c9e1651d7734f84c99b8cf49d57fa) is supported. Additionally, the template used for this site provides the following features.
* Please read the following explanations for template-specific syntax.
* For sample pages based on the explanations below, see [here](syntax-sample/).

### Creating Tables

```markdown
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

### Displaying Keyboard Keys

* Example of displaying WASD keys:

```html
<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
```

### Code Snippets

* While standard Markdown code blocks are supported, use the following syntax to apply custom CSS for better styling.
* [Supported language list](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)

```css
{% highlight css %}
#container {
    float: left;
    margin: 0 -240px 0 0;
    width: 100%;
}
{% endhighlight %}
```

### Creating Button-like Links

* Add a `class` attribute to the `<a>` tag to create button-like links. (For inline usage, the `<div>` tag is not necessary.)

```html
<div markdown="0"><a href="#" class="btn">White Button</a></div>
<div markdown="0"><a href="#" class="btn btn-success">Green Button</a></div>
<div markdown="0"><a href="#" class="btn btn-warning">Orange Button</a></div>
<div markdown="0"><a href="#" class="btn btn-danger">Red Button</a></div>
<div markdown="0"><a href="#" class="btn btn-info">Blue Button</a></div>
```

### Highlighting Text

* Add `{: .notice}` after a paragraph to highlight it with a border. This is useful for notices or warnings but can also be used for emphasis.

```markdown
**Watch out!** You can also add notices by appending `{: .notice}` to a paragraph.
{: .notice}
```

### Adding Images

* Use the `<figure>` tag to include images in articles.
* Store images in the [`assets/img`](assets/img/) directory.
* When referencing images in Markdown, prepend `{{ site.url }}/` to create an absolute path.

#### Single Image

```html
<figure>
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <figcaption>Example of a single image</figcaption>
</figure>
```

#### Two Images Side by Side

```html
<figure class="half">
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <figcaption>Example of two images side by side</figcaption>
</figure>
```

#### Three Images Side by Side

```html
<figure class="third">
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <img src="{{ site.url }}/assets/img/placeholder-big.jpg">
    <figcaption>Example of three images side by side</figcaption>
</figure>
```

### Embedding Videos

* Use YouTube's official embed code to include videos in articles. Note that the videos will not be responsive.

```html
<iframe width="560" height="315" src="//www.youtube.com/embed/SU3kYxJmWuQ" frameborder="0"> </iframe>
```

### Adding Mathematical Expressions

* Use [MathJax](http://www.mathjax.org/) to write mathematical expressions in TeX format.

```markdown
Here is an example MathJax inline rendering \\( 1/x^{2} \\), and here is a block rendering: 
\\[ \frac{1}{n^{2}} \\]
```

* Note that the escape sequence is `\\}`.
* Complex mathematical expressions can also be written.

```markdown
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

### Posts

* This category is used for introducing lab events, participation in research meetings, international conferences, etc. It functions like a blog. Add a page whenever there is a new topic.
* Typically, write a page whenever you participate in a conference or similar event. You can include not only research-related content but also the atmosphere of the conference, interesting encounters, or delicious food you found. Additionally, introduce lab events such as parties or sports tournaments, and include student awards here.
* Be mindful when assigning tags. Tags allow for automatic categorization of pages, but assigning them carelessly can make the categorization meaningless. Refer to the next section for details on tagging.
* Setting `comments` to `true` will enable a comment section at the bottom of the page.

```markdown
---
layout: post
title:  "Yokoyama Lab Official Website Renewal"
excerpt: "The Yokoyama Lab website has been renewed."
tag:
- 2022
- Announcement
- Website
comments: false
---
```

### Projects

* This category introduces an overview of the lab's research. Pages are created irregularly to explain the research being conducted by each member in an easy-to-understand manner for the general public. Add pages after completing research presentations or similar milestones.
* Unlike blog-like posts, this category is used to convey research content. For example, after presenting a new topic, write a summary of the paper here.
* Refer to the Nakamura Lab at Meiji University for inspiration:
  * https://nkmr-lab.org/news/deim2022_indecisive_komatsubara.html
* The list of pages is automatically generated with the newest ones at the top, except for "Overview of Yokoyama Lab's Research," which is pinned at the top. This page provides an overview of all research activities and is updated approximately every few years.
* To add a new research topic, use the following header in a Markdown file and place it in the `_posts` directory.
* Include tags such as "Year," "Research," and either "5G" or "Social Big Data." Additional tags can be added as needed.

```markdown
---
layout: post
title:  "Overview of Yokoyama Lab's Research"
excerpt: "An easy-to-understand explanation of the overall research activities."
project: true
pinned: true
tag:
- 2022
- Research
- 5G
- Social Big Data
comments: false
---
```

----

## About Tags

* Tags can be assigned in the header of each page. This allows for [automatic categorization of pages by tags](https://tmu.yokoyama.ac/newwebpage/tags/).
* Therefore, assign tags based on consistent rules to make the index meaningful.
* Add new tags as needed, but make sure to update this README accordingly.

### Tags for Members Pages

* Add a tag for the year of the post, such as "2022."
* Always include the tags "Lab" and "Members."

### Tags for Posts Pages

* Be cautious when assigning tags to posts, as careless tagging can lead to disorganization. Read this section carefully and refer to similar past events to decide on tags.
* Add a tag for the year of the post, such as "2022."
* Choose a tag for the type of article from the following options (feel free to create new ones if necessary, but update this README accordingly):
  * **Diary**: Reports on event participation, etc.
  * **Announcement**: Announcements from the lab (e.g., student awards, event introductions).
* Choose tags for the content of the article from the following options (multiple tags are allowed; add new ones as needed):
  * **Trip Report**: Records of conference presentations or other trips.
  * **Party**: Events such as welcome parties, farewell parties, or year-end parties.
  * **Sports**: Sports tournaments, etc.
  * **Website**: Topics related to this website.
  * **Lab**: New equipment or other updates in the lab.
* For trip reports, add additional tags based on the content:
  * **Domestic Conference**: For presentations at domestic conferences.
  * **International Conference**: For international conferences held domestically or abroad.
  * **Seminar Camp**: For joint camps with other universities, etc.
  * **Fieldwork**: For experiments conducted outside the lab.
* For conference participation, create a tag for the conference name:
  * For example, if you participate in "MEDE2022," create a tag "MEDES" (remove the year).
  * Examples: **DEIM**, **Game Informatics SIG**.
* For conference participation, create a tag for the location:
  * For domestic locations: Prefecture names, e.g., **Kanagawa**, **Kagawa**.
  * For international locations: Country names, e.g., **France**, **Germany**, **USA**.

### Tags for Projects Pages

* Add a tag for the year of the post, such as "2022."
* Always include the tag "Research."
* For presentation-related topics, always include the tag "Presentation."
* Add a tag for the presentation type: "International Conference," "Journal," or "Domestic Conference."
* Add a tag for the research field: "5G" or "Social Big Data."
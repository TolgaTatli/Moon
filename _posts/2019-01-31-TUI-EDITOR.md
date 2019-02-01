---
layout: post
title: "Tui Editor"
date: 2019-01-30
excerpt: "Tui Editor 체험기"
comments: true
---

## Tui 체험기
### Tui editor
우선 tui-editor에 대한 정보는 아래 링크에서 자세히 볼 수 있습니다.
https://github.com/nhnent/tui.editor

#### Tui editor란
![gif](http://uicdn.toast.com/tui-editor/tui-editor-preview-1520325258239.gif)

마크다운(Markdown)과 위지윅(WYSIWYG) 기능을 포함한 에디터입니다. 다양한 기능이 있어 더욱 쉽고 편하게 원하는 것을 표현할 수 있을 것 같네요 ㅎㅎ.

#### Tui editor 적용
적용시키면서 가장 참고했던 페이지
https://github.com/nhnent/tui.editor
영어가 부담스러우면 한글 버전!
https://github.com/nhnent/tui.editor/wiki/Getting-Started-Korean
참고로 tui editor는 다양한 기능이 있습니다. 
https://nhnent.github.io/tui.editor/api/latest/index.html
여기 참고하시면 다양한 예제가 있습니다. 저는 예제로 가장 기본인 basic을 적용시켰습니다.

_1. bower를 사용해서 다운로드._
`bower install --save tui-editor`


_2. 해당 html에 경로를 추가._
(bc는 bower_componets 폴더명이다 길어서 bc로 대체)
```
<!--tui-editor-->
<script src="/bc/jquery/dist/jquery.js"></script>
<script src="/bc/tui-code-snippet/dist/tui-code-snippet.js"></script>
<script src="/bc/markdown-it/dist/markdown-it.js"></script>
<script src="/bc/to-mark/dist/to-mark.js"></script>
<script src="/bc/codemirror/lib/codemirror.js"></script>
<script src="/bc/highlightjs/highlight.pack.js"></script>
<script src="/bc/squire-rte/build/squire-raw.js"></script>
<script src="/bc/tui-editor/dist/tui-editor-Editor-all.min.js"></script>
<link rel="stylesheet" href="/bc/codemirror/lib/codemirror.css">
<link rel="stylesheet" href="/bc/highlightjs/styles/github.css">
<link rel="stylesheet" href="/bc/tui-editor/dist/tui-editor.css">
<link rel="stylesheet" href="/bc/tui-editor/dist/tui-editor-contents.css">
```
만약 editor가 아닌 Viewer를 쓰고싶으면
`<script src="/bc/tui-editor/dist/tui-editor-Editor-all.min.js"></script>` 를

`<script src="/bower_components/tui-editor/dist/tui-editor-Viewer.js"></script>` 로 바꿔주세요.
참 쉽죠?
_3. html에 tui editor가 들어가기 원하는 부분에 추가_
```
<div id="editSection" class = "input-editor"></div>
```
_4-1. 자바스크립트 적용_
- Editor
```
var editor = new tui.Editor({
    el: document.querySelector('#editSection'),
    initialEditType: 'markdown',
    previewStyle: 'vertical'
});
```
- Viewer
```
var content = [
    '# 여기에 내용을 넣으세요'
  ].join('\n');

  var editor = new tui.Editor({
    el: document.querySelector('#editSection'),
    initialValue: content
  });
```

_4-2. jQuery_
- Editor
```
$('#editSection').tuiEditor({
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    height: '300px'
    });
```
- Viewer
```
var content = [
    '# 여기에 내용을 넣으세요'
  ].join('\n');

  $('#editSection').tuiEditor({
    initialValue: content
    });
```
_5. css 스타일 적용(개취옵션)_

전 height는 500px로 고정시켰고 width를 100%로 채웠습니다.
```
.input-editor{
    height: 500px;
    width: 100%;
}
```
#### Tui editor의 함수
Tui editor에는 다양한 함수들이 있다.
처음에는 어디에 이런 자료들이 있는지 몰라서 많이 헤맸다.
https://nhnent.github.io/tui.editor/api/latest/CodeBlockEditor.html#getValue 여기서 검색하면 다양한 함수를 찾을수 있습니다.
- getValue()
tui editor에 들어간 값을 return해 줍니다.
`var txt = editor.getValue();` 이런 식으로 쓰면 값 받아집니다

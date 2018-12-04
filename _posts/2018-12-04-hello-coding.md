---
layout: post
title:  "[알고리즘] 이진탐색"
date:   2018-12-04
excerpt: "알고리즘 공부, hello-coding 알고리즘"
algo: true
tag:
- 알고리즘
- hello-coding
- 이진탐색
- log

comments: true
---

## 1. 이진탐색

이진탐색은 알고리즘입니다. 입력으로는 정렬된 원소리스트를 받습니다. 
이진 탐색 알고리즘은 리스트에 원하는 원소가 있으면 그 원소의 위치를 반환하고, 아니면 null값을 반환합니다.
이진 탐색이 어떻게 동작하는가? 

ex) 1부터 100사이의 숫자 중 57을 찾는다. 이제 가능한 가장 적은 횟수의 추측으로 이 숫자를 알아내야합니다. 

100의 중간, 즉 50부터 숫자를 시작한다. 
* 숫자 50은 너무작다 -> 51 ~ 100 가운데값 -> 75
* 숫자 75은 너무크다 -> 51 ~ 75 가운데값 -> 63
* 숫자 63은 너무크다 -> 51 ~ 63 가운데값 -> <b>57</b> ( 정답발견 )

#### 이진탐색을 이용하면 단계마다 절반의 숫자를 없앨 수 있다.
* 100 -> 50 -> 25 -> 13 -> 7 -> 4 -> 2 -> 1 ( 100 중에 어느 숫자를 찾아도 최대 7번만에 찾을수있다 )

#### 또한 이진탐색은 리스트의 원소들이 정렬되어 있어야만 사용할 수 있다.
* 예를 들어, 전화번호부에 있는 이름은 알파벳 순서로 정렬되어 있기 떄문에 이름을 찾는 데 이진 탐색을 쓸 수 있다.

{% highlight html %}
// 예제소스를 작성해보았다.

public class BinarySearch { 
    public static void main(String[] args) {
        int[] arr = { 1,2,3,4,5,6,7,8,9 };
        Search S1 = new Search();
        S1.binarySearch(1,arr);
    }
}

public class Search {
    public void binarySearch(int i, int arr[]) {
        int low = 0;
        int high = arr.length - 1;
        int mid = (low+high) /2;

        while(high >= low) {
            if(i == mid) {
                System.out.println(i+"번째 인덱스에서 발견됨.");
                break;
            }

            if(i < mid) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
    }
}

{% endhighlight %}

## 2. log 
만약 n개의 원소를 가진 리스트에서 이진 탐색을 사용하면 최대 log2 n번만에 답을 찾을수있다.
로그는 거듭제곱의 반대말입니다.

<figure>
    <a href="/assets/img/hello_coding01.png"><img src="/assets/img/hello_coding01.png"></a>
    <!--<figcaption>Caption describing these two images.</figcaption>-->
</figure>


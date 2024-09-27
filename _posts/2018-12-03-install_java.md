---
layout: post
title:  "자바 설치방법"
date:   2018-12-03
excerpt: "자바 설치방법"
java: true
tag:
- java
- 자바 설치
- Jdk
- JRE
comments: true
---

## 자바 설치방법

## 1. 홈페이지 접속
<p>링크 1번 : <a href="http://java.sun.com">http://java.sun.com</a></p>
<p>링크 2번 : <a href="http://www.oracle.com">http://www.oracle.com</a></p>
<p>메인페이지에서 - java SE 다운로드</p>

## 2. java SE 8 버전 - JDK 다운로드
<p>운영체제에 맞춰서 다운로드 할것</p> 
<p>ex) Windows x64 jdk-8u191-windows-x64.exe</p>

## 3. 설치

설치시 자바설치 경로, 자바홈 설치경로 복사

<p>자바 설치경로 : C:\Java\jdk1.8.0_191</p>
<p>자바 홈설치경로 : C:\Program Files\Java\jre1.8.0_191</p>
<p>CLASSPATH : .;%JAVA_HOME%\lib\tools.jar</p>

## 4. 환경변수 설정

시작 - 제어판 - 시스템 - 고급시스템설정 - 환경변수
환경변수 설정 - 시스템변수 설정
<p>1) CLASSPATH : .;%JAVA_HOME%\lib\tools.jar</p>
<p>2) JAVA_HOME : C:\Java\jdk1.8.0_191</p>
<p>3) Path : %JAVA_HOME%\bin;</p>

## 5. 실행

환경변수 확인
<p>1) 시작 - CMD 실행</p>
<p>2) 환경변수 설정값 확인</p>

{% highlight html %}
ECHO %JAVA_HOME%
ECHO %PATH%
ECHO %CLASSPATH%
{% endhighlight %}

정상적으로 출력시 javac 입력 javac 입력후 에러메시지가 없는경우 환경변수 설정완료

시스템변수 등록확인

<figure>
    <a href="/assets/img/java_01.png"><img src="/assets/img/java_01.png"></a>
    <!--<figcaption>Caption describing these two images.</figcaption>-->
</figure>

## 6. 테스트 

1) 편집기 실행 

MyPf.java 작성 ( 테스트파일 작성 )

{% highlight html %}
public class MyPf {
    public static void main(String[] args) {
        System.out.println("본인이름 : 최원오");
        System.out.println("email : treasure_b@naver.com");
        System.out.println("각오 : 잘하고 싶습니다.");
    }
}
{% endhighlight %}

<b>주의할점 : 인코딩 UTF-8로 저장, 파일 클래스명 = 실제파일명 일치</b>

2) javac 컴파일 명령 실행

<b>javac MyPf.java 실행 jvm에서 클래스패스 경로 확인->MyPf.java를 메모리에 올리고 class파일 생성</b>

<b>인코딩 에러 날시 javac MyPf.java -encoding UTF-8</b>

3) java 클래스파일명 실행

public static void main(String[] args){} 를 시작점으로 인터프리터 
방식으로 파일을 읽고 결과값을 출력. 


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

## 1. www.java.sun.com 접속
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
<p>ECHO %JAVA_HOME%</p>
<p>ECHO %PATH%</p>
<p>ECHO %CLASSPATH%</p>

정상적으로 출력시 javac 입력 javac 입력후 에러메시지가 없는경우 환경변수 설정완료

## 6. 테스트 

1) 편집기 실행 

MyPf.java 작성 ( 테스트파일 작성 )

{% highlight html %}
public class MyPf {
    public static void main(String[] args) {
        System.out.println("본인이름 : 최원오");
        System.out.println("email : treasure_b@naver.com");
        System.out.println("각오 : 열심히 보다는 잘하고 싶습니다.");
    }
}
{% endhighlight %}

주의할점 : 인코딩 UTF-8로 저장, 파일 클래스명 = 실제파일명 일치

2) javac 컴파일 명령 실행

<p>C:\Java\Work로 이동 -> javac MyPf.java 실행 jvm에서 클래스패스 경로 확인</p> 
<p>-> MyPf.java를 메모리에 올리고 class파일 생성</p>

인코딩 에러 날시 
javac MyPf.java -encoding UTF-8

3) java 클래스파일명 실행

public static void main(String[] args){} 를 시작점으로 인터프리터 
방식으로 파일을 읽고 결과값을 출력. 


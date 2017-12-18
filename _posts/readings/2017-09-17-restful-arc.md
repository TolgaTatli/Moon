---
title: "Foundations of RESTful Architecture"
author: "NOWHERE"
description: "This post is a review for the article 'Foundations of RESTFUL Architecture'."
date: "2017-09-17"
tags: [RESTFul Architecture]
categories: [readings]
permalink: /:categories/:title
---
<!-- TOC -->

- [Synthesis](#synthesis)
- [The Basics](#the-basics)
- [REST and SOAP](#rest-and-soap)
- [Verbs](#verbs)

<!-- /TOC -->
### Synthesis

In this blog, I will do a quick review on the article [Foundations of RESTful Architecture](https://dzone.com/refcardz/rest-foundations-restful). This paper introduces the basic idea about the RESTful architecture, the difference between SOAP and RESTful architecture and its related main verbs.

### The Basics

The Representational State Transfer Architecture is not a certain technology or external library which could be embeded with developers' program, its existence is to elevate the information into a first level element of the web applications/architectures.

The RESTful architecture mainly interact with the Uniform Resource Locator (URL), which exists as a handle for the resource, the thing can be requested, updated and deleted.

The content returned could be represented with different kinds of format, such as XML, JSON, hypermedia format (Atom) and a customized Multipurpose Internet Mail Extensions (MIME) type. By using content negotiation, people could choose a representational format to denote the content return (the server must support such kind of representation).

### REST and SOAP

The first thing we have to know is that ***REST != SOAP***, even though they could achieve the same target under many situations.

The best practice for REST is to manage systems with decoupling the information that is generated and consumed from the technologies that produce and consume it. While, the one for SOAP is solve the situation that when the lifecycle of a request cannot be maintained in the scopre of a signle transaction for technological, organizational or procedural complications.

To distinguish these two theory better, you can refer to the [Richardson Maturity Model](https://restfulapi.net/richardson-maturity-model/), where SOAP only lies in the level 0, while REST can range from 0 to 3 based on the actual design in different extents.

### Verbs

- GET

> GET is one of the most frequently referred terminology in web design. It SAFELY transfers the represenrations of named resources from a server to a client, which means it will not modify the content on the server side and when it is interrupted during the requesting process, user could issue it again wihtout any side-effects (idempotency).

- POST

> POST is usually can be used to create or update a resource when the client cannot predict the identity of the resource that it is requesting to be created, for example, hiring people, placing orders and submitting forms. Then, the server will accept the POST request, validate it, verify the user's credentials and so on to ensure the request is legal and the will return response code 201 to show the POST process is successful.
>
> POST can also be used to "append" content to the existing resource, for example adding a new shipping address to an order or updating the quantity of an item in a cart.
>
> Under some situations, POST can realize the same function as the GET can. However, it is not recommended to use POST to replace GET because GET is safer and can be easily cached.

- PUT

> PUT can also be used to do overwrite action, which means PUT can be used to request a already known resource/URL. The PUT is idempotent, which when the PUT process is interupted during the process, user could redo it again, while user cannot do such action when do POST.

- DELETE

> DELETE can remvoe certain content of the target resource, if the content exists. Once the request succeeds, the server will return response code 204 (No Content), which denotes that the process is successfully processed, but the server does not have the response. It may take some extra handling to keep track of previously deleted resources and resources that never existed (which should return a 404 -- here I think it means developer should track the resource and to avoid the occurrence of 404).so DETELE does not leak information about the presence of resources.

For the other three verbs (*HEAD*, *OPTIONS* and *PATCH*), if you want to,you can refer to the [original article](https://dzone.com/refcardz/rest-foundations-restful) and I will not cover them here, since they are not that in common use.

For all the response code, you can refer to the [Statsu Code and Reason Phrase](https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.1.1) of [Hypertext Transfer Protocol -- HTTP/1.1](https://www.w3.org/Protocols/rfc2616/rfc2616.html).
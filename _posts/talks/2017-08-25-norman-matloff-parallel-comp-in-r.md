---
title: "Parallel Computation in R: What We Want, and How We (Might) Get It"
author: "NOWHERE"
description: "A keynote that was made by Prof. Norman Matloff on the useR! International R User 2017 Conference."
date: "2017-08-25"
tags: [Parallel Computation, R Programming]
categories: [talks]
permalink: /:categories/:title
---

<iframe src="https://channel9.msdn.com/Events/useR-international-R-User-conferences/useR-International-R-User-2017-Conference/KEYNOTE-Parallel-Computation-in-R-What-We-Want-and-How-We-Might-Get-It/player" width="100%" height="315" allowFullScreen frameBorder="0"></iframe>

Norman Matloff made this talk in the useR! International R User 2017 Conference. He talked about his `Software Alchemy (SA)` theory, which in a nut shell:
> The `SA` means that just break data inito chunks, apply estimators such as lm() to each chunk, then average the results. Doing this parallelly with r processes in your machine and r chunks. You could get almost the same accuracy of your model.

I think the "almost" here should be fine: sacrificing a tiny accuracy but get much quicker speed on processing your data, gaining *superlinear* speed up (if you distribute your data on r processors, then the speed will usually be faster than r times of your og one).

Also, Norman gave another idea that besides the `SA`, the `Leave it there` concept can also be used. `Leave it there` is correlated with distributed computation:
> when the manager node distributes data to every nodes/workers, then workers will work its own data, and within the notion of `Leave it there`, just DO NOT GATHER the results and keep them as a distributed form (only gather them when you really need them).
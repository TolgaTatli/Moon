---
layout: page
title: Contact
excerpt: "Contact Me"
comments: false
---

<div style='text-align: center; display: block'>
  <form action="https://getsimpleform.com/messages?form_api_token=f994b615dd47add56e46e58e0a26689b" method="post">
  <!-- <input type='hidden' name='redirect_to' value='full-url/thank-you/' /> -->
    <input type='hidden' name='redirect_to' value="{{ site.url }}/thank-you" />
    <input type='text' name='name' placeholder='Your Full Name' /> <br>
    <input type='email' name='email' placeholder='Your E-mail Address' /> <br>
    <textarea name='message' placeholder='Write your message ...'></textarea> <br>
    <input type='submit' value='Send Message' />
  </form>
</div>

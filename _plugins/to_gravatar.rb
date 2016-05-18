require 'digest/md5'

module Jekyll
  module GravatarFilter
    def to_gravatar(input, size=135)
      "//www.gravatar.com/avatar/#{hash(input)}?s=#{size}"
    end

    private :hash

    def hash(email)
      email_address = email ? email.downcase.strip : ''
      Digest::MD5.hexdigest(email_address)
    end
  end
end

Liquid::Template.register_filter(Jekyll::GravatarFilter)

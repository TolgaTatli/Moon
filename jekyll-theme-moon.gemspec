Gem::Specification.new do |s|
    s.name        = 'jekyll-theme-moon'
    s.version     = '0.1.0'
    s.date        = '2018-01-14'
    s.summary     = "Minimal, one column jekyll theme."
    s.description = "Moon is a minimal, one column jekyll theme for your blog."
    s.authors     = ["Taylan Tatlı"]

    s.files         = `git ls-files -z`.split("\x0").select do |f|
        f.match(%r!^(assets|_(includes|layouts|sass)/|(LICENSE|README)((\.(txt|md)|$)))!i)
    end

    s.homepage    =
        'https://github.com/TaylanTatli/Moon'
    s.license       = 'MIT'
end

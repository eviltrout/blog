###
# Blog settings
###

activate :blog do |blog|
  blog.layout = "article"
end

page "/feed.xml", :layout => false


activate :syntax

set :markdown_engine, :redcarpet
set :markdown, :fenced_code_blocks => true, :smartypants => true

###
# Page options, layouts, aliases and proxies
###

set :css_dir, 'stylesheets'

set :js_dir, 'javascripts'

set :images_dir, 'images'

# Build-specific configuration
configure :build do

  activate :asset_host
  set :asset_host do |asset|
    "http://cdn.eviltrout.com"
  end

end


helpers do

  def current_index
    @current_index ||= blog.articles.index(current_article)
  end

  def previous_article
    return @previous_article if @previous_article

    if current_index && ((current_index + 1) < blog.articles.size)
      @previous_article = blog.articles[current_index+1]
    end
  end

  def next_article
    return @next_article if @next_article

    if current_index && (current_index - 1) >= 0
      @next_article = blog.articles[current_index-1]
    end
  end
end

module Middleman::Blog::BlogArticle
  def absolute_url(development)
    if development
      "http://localhost:4567#{url}"
    else
      "http://eviltrout.com#{url}"
    end
  end
end

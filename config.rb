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



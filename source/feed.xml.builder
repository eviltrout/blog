xml.instruct!
xml.feed "xmlns" => "http://www.w3.org/2005/Atom" do
  xml.title "Evil Trout's Blog"
  xml.subtitle "The Evilist Trout of them all"
  xml.id "http://eviltrout.com/"
  xml.link "href" => "http://eviltrout.com/"
  xml.link "href" => "http://eviltrout.com/feed.xml", "rel" => "self"
  xml.updated blog.articles.first.date.to_time.iso8601
  xml.author { xml.name "Robin Ward" }

  blog.articles[0..5].each do |article|
    xml.entry do
      xml.title article.title
      xml.link "rel" => "alternate", "href" => "http://eviltrout.com#{article.url}"
      xml.id "http://eviltrout.com#{article.url}"
      xml.published article.date.to_time.iso8601
      xml.updated article.date.to_time.iso8601
      xml.author { xml.name "Evil Trout" }
      xml.summary article.summary, "type" => "html"
      xml.content article.body, "type" => "html"
    end
  end
end

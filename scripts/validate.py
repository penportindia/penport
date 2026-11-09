import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "catalogue.html", "book-demo.html", "thank-you.html"]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.h1 = 0
        self.canonicals = []
        self.meta = {}
        self.title = ""
        self.schemas = []
        self.current = None
        self.buffer = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        for key in ["href", "src"]:
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag == "title" or (tag == "script" and attrs.get("type") == "application/ld+json"):
            self.current = tag
            self.buffer = []

    def handle_data(self, data):
        if self.current:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag == self.current:
            text = "".join(self.buffer)
            if tag == "title":
                self.title = text
            else:
                self.schemas.append(json.loads(text))
            self.current = None


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_blog_build():
    output = ROOT / "_site"
    articles = list((output / "blog").glob("*/index.html"))
    require(bool(articles), "Built blog articles are missing")
    for path in [output / "blog/index.html", *articles]:
        source = path.read_text(encoding="utf-8")
        page = Page()
        page.feed(source)
        require(page.h1 == 1, f"{path}: expected one H1")
        require(len(page.ids) == len(set(page.ids)), f"{path}: duplicate IDs")
        require(len(page.canonicals) == 1 and page.meta.get("description"),
                f"{path}: missing SEO metadata")
        require("{{" not in source and "{%" not in source, f"{path}: unrendered Liquid")
        if path in articles:
            require(any(schema.get("@type") == "BlogPosting" for schema in page.schemas),
                    f"{path}: missing BlogPosting schema")
            require("PenportSchoolMS" in source and "Penport ID Card Solution" in source,
                    f"{path}: missing product promotion")
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc or not url.path:
                continue
            require(url.path.startswith("/penport/"), f"{path}: incorrect base URL {link}")
            target = output / unquote(url.path.removeprefix("/penport/"))
            require(target.is_file() or (target / "index.html").is_file(),
                    f"{path}: missing built link {link}")
    sitemap = ET.parse(output / "sitemap.xml")
    urls = {node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
    for path in articles:
        url = "https://penportindia.github.io/penport/" + path.parent.relative_to(output).as_posix() + "/"
        require(url in urls, f"Article missing from sitemap: {url}")
    ET.parse(output / "feed.xml")
    print(f"PASS built blog: {len(articles)} articles, SEO, schema, local links, sitemap and feed")


def main():
    if "--built" in sys.argv:
        validate_blog_build()
        return
    pages = {}
    for filename in PAGES:
        page = Page()
        page.feed((ROOT / filename).read_text(encoding="utf-8"))
        pages[filename] = page
        require(page.h1 == 1, f"{filename}: expected one H1")
        require(len(page.ids) == len(set(page.ids)), f"{filename}: duplicate IDs")
        require(bool(page.title and page.meta.get("description")), f"{filename}: missing metadata")
        require(len(page.canonicals) == 1, f"{filename}: expected one canonical")
        require(page.canonicals[0].startswith("https://"), f"{filename}: invalid canonical")
        require(("noindex" in page.meta.get("robots", "")) == (filename == "thank-you.html"),
                f"{filename}: incorrect indexing setting")
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            target = ROOT / unquote(url.path) if url.path else ROOT / filename
            require(target.is_file() or (target.is_dir() and (target / "index.html").is_file()),
                    f"{filename}: missing local target {link}")
            if url.fragment and target.name in PAGES:
                target_page = Page()
                target_page.feed(target.read_text(encoding="utf-8"))
                require(unquote(url.fragment) in target_page.ids,
                        f"{filename}: missing fragment {link}")
        print(f"PASS {filename}: metadata, schema JSON, IDs and links")

    require(len({p.title for p in pages.values()}) == len(PAGES), "Page titles must be unique")
    for filename, page in pages.items():
        if filename == "thank-you.html":
            continue
        require(page.meta.get("og:title") == page.title and
                page.meta.get("twitter:title") == page.title,
                f"{filename}: social titles must match the page title")
        require(page.meta.get("og:description") == page.meta["description"] and
                page.meta.get("twitter:description") == page.meta["description"],
                f"{filename}: social descriptions must match the search description")
        require(page.meta.get("og:url") == page.canonicals[0],
                f"{filename}: social URL must match the canonical")

    organizations = [node for schema in pages["index.html"].schemas
                     for node in schema.get("@graph", []) if node.get("@type") == "Organization"]
    require(len(organizations) == 1, "Home must describe one company")
    company = organizations[0]
    require(company.get("name") == "Penport India" and company.get("foundingDate") == "2021",
            "Company name or founding year differs from the confirmed profile")
    require(company.get("address", {}).get("addressLocality") == "Patna" and
            company.get("address", {}).get("addressRegion") == "Bihar" and
            company.get("address", {}).get("addressCountry") == "IN",
            "Company location differs from the confirmed profile")
    require(company.get("founder", {}).get("name") == "Raushan Singh",
            "Company founder differs from the confirmed profile")
    sitemap_source = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    sitemap = ET.ElementTree(ET.fromstring(sitemap_source.split("---", 2)[-1].strip()))
    urls = [node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    expected = {pages[p].canonicals[0] for p in PAGES if p != "thank-you.html"}
    static_urls = [url for url in urls if "{{" not in url]
    require(set(static_urls) == expected and len(static_urls) == len(expected),
            "Sitemap must match indexable canonicals")
    require("for post in site.posts" in sitemap_source and "'/blog/' | absolute_url" in sitemap_source,
            "Sitemap must include the blog and automatically include posts")

    source = (ROOT / "assets/js/catalogue.js").read_text(encoding="utf-8")
    source_names = re.findall(r'name: "([^"]+)"', source.split("const CATEGORIES")[0])
    items = [node for schema in pages["catalogue.html"].schemas
             for node in schema.get("@graph", []) if node.get("@type") == "ItemList"]
    require(len(items) == 1, "Catalogue must have one ItemList")
    schema_names = [item["item"]["name"] for item in items[0]["itemListElement"]]
    require(source_names == schema_names, "Catalogue source and schema names differ")
    markup = (ROOT / "catalogue.html").read_text(encoding="utf-8")
    require(markup.count('class="project-card"') == len(source_names),
            "Static catalogue card count differs from source")
    for path in (ROOT / "assets/js").glob("*.js"):
        subprocess.run(["node", "--check", str(path)], check=True, capture_output=True)
    print("PASS sitemap, catalogue consistency and JavaScript syntax")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, json.JSONDecodeError, ET.ParseError, subprocess.CalledProcessError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)

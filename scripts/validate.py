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


def main():
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
            require(target.is_file(), f"{filename}: missing local target {link}")
            if url.fragment and target.name in PAGES:
                target_page = Page()
                target_page.feed(target.read_text(encoding="utf-8"))
                require(unquote(url.fragment) in target_page.ids,
                        f"{filename}: missing fragment {link}")
        print(f"PASS {filename}: metadata, schema JSON, IDs and links")

    require(len({p.title for p in pages.values()}) == len(PAGES), "Page titles must be unique")
    sitemap = ET.parse(ROOT / "sitemap.xml")
    urls = [node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    expected = {pages[p].canonicals[0] for p in PAGES if p != "thank-you.html"}
    require(set(urls) == expected and len(urls) == len(expected), "Sitemap must match indexable canonicals")

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

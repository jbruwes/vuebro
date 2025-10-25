import type { TImportmap, TFeed, TPage } from "@vuebro/shared";
import type { SFCDescriptor } from "vue/compiler-sfc";
import type { Ref } from "vue";

import {
  removeEmptyDirectories,
  getObjectBlob,
  getObjectText,
  deleteObject,
  headObject,
  putObject,
  bucket,
} from "stores/io";
import { importmap, atlas, fonts, nodes, pages, feed } from "@vuebro/shared";
import { writable, second, cache } from "stores/defaults";
import { computed, reactive, watch, ref } from "vue";
import toString from "vue-sfc-descriptor-to-string";
import jsonfeedToAtom from "jsonfeed-to-atom";
import jsonfeedToRSS from "jsonfeed-to-rss";
import { editor, Uri } from "monaco-editor";
import { consola } from "consola/browser";
import { parse } from "vue/compiler-sfc";
import { debounce } from "quasar";
import { toXML } from "to-xml";

type TAppPage = {
  jsonld: Promise<editor.ITextModel>;
  sfc: Promise<editor.ITextModel>;
  html: Promise<string> | string;
  contenteditable: boolean;
} & TPage;

const domain = ref("");

const putPage = (async () => {
    let body: string;

    const putPage = async ({
        description,
        keywords,
        branch,
        images,
        jsonld,
        title,
        path,
        type,
        loc,
        to,
      }: TAppPage) => {
        let value;
        try {
          value = JSON.stringify(
            JSON.parse((await jsonld).getValue()),
            null,
            1,
          );
        } catch {
          value = JSON.stringify(JSON.parse(initJsonLD), null, 1);
        }
        const canonical =
            domain.value &&
            `https://${domain.value}${to === "/" ? "" : (to ?? "")}`,
          htm = body
            .replace(
              '<base href="" />',
              `<base href="${
                Array(branch.length - 1)
                  .fill("..")
                  .join("/") || "./"
              }" />`,
            )
            .replace(
              "</head>",
              `  <title>${title ?? ""}</title>
    ${canonical && `<link rel="canonical" href="${canonical.replaceAll('"', "&quot;")}">`}
    ${[
      [description ?? "", "description"],
      [keywords.join(), "keywords"],
    ]
      .filter(([content]) => content)
      .map(
        ([content, name]) =>
          content &&
          name &&
          `<meta name="${name}" content="${content.replaceAll('"', "&quot;")}">`,
      ).join(`
    `)}
    ${[
      [canonical, "url"],
      [description ?? "", "description"],
      [title, "title"],
      [type ?? "", "type"],
      ...(domain.value
        ? images.flatMap(({ alt, url }) => [
            [url ? `https://${domain.value}/${url}` : "", "image"],
            [alt ?? "", "image:alt"],
          ])
        : []),
    ]
      .filter(([content]) => content)
      .map(
        ([content, property]) =>
          content &&
          property &&
          `<meta property="og:${property}" content="${content.replaceAll('"', "&quot;")}">`,
      ).join(`
    `)}
    ${
      value &&
      `<script type="application/ld+json" id="application/ld+json">
${value}
    </script>`
    }
  </head>`,
            );
        if (loc)
          putObject(`${loc}/index.html`, htm, "text/html").catch(consola.error);
        putObject(
          path ? `${path}/index.html` : "index.html",
          htm,
          "text/html",
        ).catch(consola.error);
      },
      oldPages: Record<string, undefined | string | null>[] = [],
      index = await (await fetch("runtime/index.html")).text();

    watch(
      [pages, importmap, domain],
      debounce(async (arr) => {
        const [page, imap] = arr as [TPage[], TImportmap, string],
          promises: Promise<void>[] = [],
          [{ title = "" } = {}] = page;
        oldPages.forEach(({ path, loc }) => {
          if (loc && !page.find((value) => value.loc === loc))
            promises.push(deleteObject(`${loc}/index.html`));
          if (!page.find((value) => value.path === path))
            promises.push(
              deleteObject(path ? `${path}/index.html` : "index.html"),
            );
        });
        await Promise.allSettled(promises);
        await removeEmptyDirectories();
        body = index
          .replace(
            '<base href="" />',
            `<base href="" />
    <script type="importmap">
${JSON.stringify(imap, null, 1)}
    </script>
    <link rel="alternate" title="${title}" type="application/feed+json" href="./feed.json" />
    <link rel="alternate" title="${title}" type="application/atom+xml" href="./feed.xml" />
    <link rel="alternate" title="${title}" type="application/rss+xml" href="./feed-rss.xml" />`,
          )
          .replace(
            "</head>",
            `  ${Object.values(imap.imports)
              .filter((href) => !href.endsWith("/"))
              .map(
                (href) =>
                  `<link rel="modulepreload" crossorigin href="${href}">`,
              ).join(`
    `)}
  </head>`,
          );
        oldPages.length = 0;
        (page as TAppPage[])
          .filter(({ path }) => path !== undefined)
          .forEach((value) => {
            const { path, loc } = value;
            oldPages.push({ path, loc });
            void putPage(value);
          });
      }, second),
      { deep: true },
    );

    return putPage;
  })(),
  manifest = (await (
    await fetch("runtime/.vite/manifest.json")
  ).json()) as Record<string, Record<string, string>>,
  staticEntries = Object.values(manifest)
    .filter(({ isStaticEntry }) => isStaticEntry)
    .map(({ file, name }) => [name, file]),
  the = computed(
    () =>
      (atlas.value[selected.value ?? ""] ?? pages.value[0]) as
        | undefined
        | TAppPage,
  ),
  initJsonLD = `{
    "@context": "https://schema.org"
}`,
  urls = reactive(new Map<string, string>()),
  selected: Ref<undefined | string> = ref(),
  deleted: Ref<undefined | TPage> = ref(),
  routerLink = "router-link",
  prevImages: string[] = [],
  parser = new DOMParser(),
  rightDrawer = ref(false);

let descriptor: SFCDescriptor | undefined;

const html = {
    async set(this: TAppPage, value: string) {
      const sfc: editor.ITextModel = await this.sfc,
        doc = getDocument(value);
      doc.querySelectorAll("a").forEach((a) => {
        try {
          const url = new URL(
            a.attributes.getNamedItem("href")?.value ?? "",
            window.location.origin,
          );
          if (
            Boolean(a.dataset[routerLink]) ||
            (window.location.origin === url.origin &&
              url.href === `${url.origin}${url.pathname}`)
          ) {
            a.removeAttribute(`data-${routerLink}`);
            const link = document.createElement(routerLink);
            link.innerHTML = a.innerHTML;
            [...a.attributes].forEach((attr) => {
              if (attr.nodeName === "href")
                link.setAttribute("to", attr.nodeValue ?? "");
              else link.setAttributeNode(attr.cloneNode() as Attr);
            });
            a.replaceWith(link);
          }
        } catch {
          //
        }
      });
      [...doc.images].forEach((image) => {
        if (image.dataset.src) {
          image.setAttribute("src", image.dataset.src);
          image.removeAttribute("data-src");
        }
      });
      if (descriptor) {
        if (descriptor.template)
          descriptor.template.content = doc.body.innerHTML;
        sfc.setValue(
          `${
            descriptor.template
              ? ""
              : `<template>${doc.body.innerHTML}</template>
`
          }${(toString as (sfcDescriptor: SFCDescriptor) => string)(descriptor)}`,
        );
      }
    },
    async get(this: TAppPage) {
      ({ descriptor } = parse((await this.sfc).getValue()));
      const { template } = descriptor;
      const { content } = template ?? {};
      const doc = getDocument(content ?? "");
      doc.querySelectorAll(routerLink).forEach((link) => {
        const a = document.createElement("a");
        a.innerHTML = link.innerHTML;
        a.setAttribute(`data-${routerLink}`, "true");
        [...link.attributes].forEach((attr) => {
          if (attr.nodeName === "to")
            a.setAttribute("href", attr.nodeValue ?? "");
          else a.setAttributeNode(attr.cloneNode() as Attr);
        });
        link.replaceWith(a);
      });
      (
        await Promise.all(
          [...doc.images].map((image) => {
            const src = image.getAttribute("src");
            return src && !urls.has(src)
              ? getObjectBlob(src)
              : Promise.resolve(undefined);
          }),
        )
      ).forEach((image, index) => {
        const src = doc.images[index]?.getAttribute("src") ?? "";
        if (image?.size) urls.set(src, URL.createObjectURL(image));
        const url = urls.get(src);
        if (url) {
          doc.images[index]?.setAttribute("data-src", src);
          doc.images[index]?.setAttribute("src", url);
        }
      });
      return doc.body.innerHTML;
    },
  },
  getModel = async (
    id: string,
    ext: string,
    language: string,
    mime: string,
    init: string,
  ) => {
    const uri = Uri.parse(`file:///${id}.${language}`);
    let model = editor.getModel(uri);
    const initObject = async () => {
      if (model && id) {
        putObject(`pages/${id}.${ext}`, model.getValue(), mime).catch(
          consola.error,
        );
        if (language === "json" && atlas.value[id])
          void (await putPage)(atlas.value[id] as TAppPage);
      }
    };
    if (!model) {
      const value = await getObjectText(`pages/${id}.${ext}`, cache);
      model = editor.createModel(value || init, language, uri);
      model.onDidChangeContent(debounce(initObject, second));
      if (!value) await initObject();
    }
    return model;
  },
  cleaner = (value: TAppPage[]) => {
    value.forEach((page) => {
      const { children, images, id } = page;
      if (children.length) cleaner(children as TAppPage[]);
      images.forEach(({ url }) => {
        void deleteObject(url);
      });
      if (id) {
        void deleteObject(`pages/${id}.vue`);
        void deleteObject(`pages/${id}.jsonld`);
      }
    });
  },
  jsonld = {
    get(this: TAppPage) {
      return this.id
        ? getModel(this.id, "jsonld", "json", "application/ld+json", initJsonLD)
        : undefined;
    },
  },
  sfc = {
    get(this: TAppPage) {
      return this.id
        ? getModel(this.id, "vue", "vue", "text/plain", "<template></template>")
        : undefined;
    },
  },
  getDocument = (value: string) =>
    parser.parseFromString(
      `<head><base href="//"></head><body>${value}</body>`,
      "text/html",
    );

watch(deleted, (value) => {
  if (value) cleaner([value as TAppPage]);
});

watch(
  the,
  (value, oldValue) => {
    const images = value?.images.map(({ url = "" }) => url);
    if (images) {
      if (value?.id === oldValue?.id) {
        prevImages
          .filter((url) => !images.includes(url))
          .forEach((url) => {
            URL.revokeObjectURL(urls.get(url) ?? "");
            urls.delete(url);
            deleteObject(url).catch(consola.error);
          });
      }
      prevImages.length = 0;
      prevImages.push(...images);
    }
  },
  { deep: true },
);

watch(pages, (objects) => {
  const value = false,
    contenteditable = { writable, value };
  objects.forEach((object) => {
    Object.defineProperties(object, {
      contenteditable,
      jsonld,
      html,
      sfc,
    });
  });
});

watch(bucket, async (value) => {
  if (value) {
    (async () => {
      nodes.push(
        (
          JSON.parse(
            (await getObjectText("index.json", cache)) || "[{}]",
          ) as TPage[]
        )[0] ?? ({} as TPage),
      );
    })().catch(consola.error);
    (async () => {
      fonts.length = 0;
      fonts.push(
        ...(JSON.parse(
          (await getObjectText("fonts.json", cache)) || "[]",
        ) as never[]),
      );
    })().catch(consola.error);
    (async () => {
      const { imports } = JSON.parse(
        (await getObjectText("index.importmap", cache)) || "{}",
      ) as TImportmap;
      importmap.imports = imports;
    })().catch(consola.error);
    (async () => {
      const { items } = JSON.parse(
        (await getObjectText("feed.json", cache)) || "{}",
      ) as TFeed;
      feed.items = items;
    })().catch(consola.error);
    (async () => {
      {
        const [cname = ""] = (await getObjectText("CNAME", cache)).split(
          "\n",
          1,
        );
        domain.value = cname.trim();
      }
      watch(domain, (cname) => {
        putObject("CNAME", cname, "text/plain").catch(consola.error);
      });
    })().catch(consola.error);
    const [localManifest, serverManifest] = (
      [
        manifest,
        JSON.parse((await getObjectText(".vite/manifest.json", cache)) || "{}"),
      ] as Record<string, Record<string, string[]> | undefined>[]
    ).map(
      (element) =>
        new Set(
          [
            ...Object.values(element).map(({ file } = {}) => file),
            ...(element["index.html"]?.css ?? []),
          ].filter(Boolean) as string[],
        ),
    );
    if (localManifest && serverManifest) {
      const files = ["robots.txt", "fonts.json"];
      (
        await Promise.allSettled(files.map((file) => headObject(file, cache)))
      ).forEach(({ status }, index) => {
        if (status === "rejected" && files[index])
          localManifest.add(files[index]);
      });
      [...serverManifest]
        .filter((x) => !localManifest.has(x))
        .forEach((element) => {
          deleteObject(element).catch(consola.error);
        });
      [...localManifest.add(".vite/manifest.json")]
        .filter((x) => !serverManifest.has(x))
        .forEach((element) => {
          (async () => {
            const body = await (await fetch(`runtime/${element}`)).blob();
            putObject(
              element,
              new Uint8Array(await body.arrayBuffer()),
              body.type,
            ).catch(consola.error);
          })().catch(consola.error);
        });
    }
  } else {
    nodes.length = 0;
    editor.getModels().forEach((model) => {
      model.dispose();
    });
    urls.forEach((url, key) => {
      URL.revokeObjectURL(url);
      urls.delete(key);
    });
  }
});

watch(
  nodes,
  debounce((value) => {
    if (value)
      putObject("index.json", JSON.stringify(value), "application/json").catch(
        consola.error,
      );
  }, second),
  { deep: true },
);

watch(
  fonts,
  debounce((value, oldValue) => {
    if (oldValue)
      putObject("fonts.json", JSON.stringify(value), "application/json").catch(
        consola.error,
      );
  }),
);

watch(
  importmap,
  debounce((value, oldValue) => {
    const { imports } = value as TImportmap;
    let save = Boolean(oldValue);
    staticEntries.forEach(([key = "", value = ""]) => {
      if (imports[key] !== `./${value}`) {
        imports[key] = `./${value}`;
        save = true;
      }
    });
    if (save)
      putObject(
        "index.importmap",
        JSON.stringify({ imports }),
        "application/importmap+json",
      ).catch(consola.error);
  }),
  { deep: true },
);

watch(
  [pages, feed, domain],
  debounce((arr) => {
    const [page, value, tld] = arr as [TPage[], TFeed, string],
      [{ title } = {}] = page,
      { items } = value;
    const jsonfeed = {
      version: "https://jsonfeed.org/version/1",
      items,
      title,
    } as TFeed;
    if (tld) {
      jsonfeed.feed_url = `https://${tld}/feed.json`;
      jsonfeed.home_page_url = `https://${tld}`;
    }
    putObject(
      "feed.json",
      JSON.stringify(jsonfeed),
      "application/feed+json",
    ).catch(consola.error);
    if (title && tld) {
      putObject(
        "feed.xml",

        jsonfeedToAtom(jsonfeed) as string,
        "application/atom+xml",
      ).catch(consola.error);
      putObject(
        "feed-rss.xml",

        jsonfeedToRSS(jsonfeed) as string,
        "application/rss+xml",
      ).catch(consola.error);
    }
  }),
  { deep: true },
);

watch(
  [pages, domain],
  debounce((arr) => {
    const [page, cname] = arr as [TPage[], string];
    if (cname) {
      putObject(
        "sitemap.xml",
        toXML({
          urlset: {
            url: [
              ...page
                .filter(({ enabled, path }) => enabled && path !== undefined)
                .map(({ changefreq, priority, lastmod, to }) => ({
                  ...(changefreq && { changefreq }),
                  ...(lastmod && { lastmod }),
                  ...(priority && { priority }),
                  loc: `https://${cname}${to === "/" ? "" : encodeURI(to ?? "")}`,
                })),
              ...page
                .filter(({ enabled, loc }) => enabled && loc)
                .map(({ changefreq, priority, lastmod, loc }) => ({
                  ...(changefreq && { changefreq }),
                  ...(lastmod && { lastmod }),
                  ...(priority && { priority }),
                  loc: `https://${cname}${encodeURI(loc?.replace(/^\/?/, "/").replace(/\/?$/, "/") ?? "")}`,
                })),
            ],
            "@xmlns": "https://www.sitemaps.org/schemas/sitemap/0.9",
          },
          "?": 'xml version="1.0" encoding="UTF-8"',
        }),
        "application/xml",
      ).catch(consola.error);
    }
  }, second),
  { deep: true },
);

export type { TAppPage };

export { staticEntries, rightDrawer, selected, deleted, domain, urls, the };

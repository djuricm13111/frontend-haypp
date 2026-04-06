import heroImage from "../../assets/images/blog/velo-mini-vs-slim-hero.jpeg";
import differencesInfographic from "../../assets/images/blog/velo-mini-vs-slim-infographic-haypp.jpg";
import relatedImgNicotineVsVape from "../../assets/images/blog/nicotine-pouches-vs-vapes.webp";
/** Ista slika kao hero na članku Pablo review */
import relatedImgPablo from "../../assets/images/blog/pablo-snus-review-article.jpg";
import relatedImgBeginner from "../../assets/images/blog/beginners-nicotine-pouches.webp";

/**
 * VELO Mini vs Slim (en / de).
 *
 * Konfiguracija:
 * - heroImage — hero pored naslova; fajl u `src/assets/images/blog/`.
 * - differencesInfographic — ispod naslova „Differences Between…“.
 * - relatedArticles[] — title, excerpt, to, image (webpack import za svaku karticu).
 */
export const veloMiniVsSlim = {
  slug: "velo-mini-vs-slim",
  /** Glavna slika članka (webpack import) */
  heroImage,
  /** Infografik ispod sekcije „Differences Between VELO Mini vs Slim“ */
  differencesInfographic,
  category: {
    en: "Nicotine pouches",
    de: "Nikotinbeutel",
  },
  published: "2026-04-06",
  author: {
    en: "Ruby Forbes",
    de: "Ruby Forbes",
  },
  meta: {
    title: {
      en: "VELO Mini vs Slim: What's the Difference?",
      de: "VELO Mini vs. Slim: Was ist der Unterschied?",
    },
    description: {
      en:
        "Compare VELO mini and slim nicotine pouches: size, strength, flavour duration, pouch count, and which format fits your preference.",
      de:
        "VELO Mini und Slim im Vergleich: Größe, Stärke, Geschmacksdauer, Beutelanzahl und welches Format zu Ihnen passt.",
    },
  },
  intro: {
    en:
      "When it comes to VELO mini vs slim, the main differences are size, strength, and experience. VELO mini pouches are smaller, more discreet, and come in lower strengths, while VELO slim are longer, have more strength options, and last longer. Find out which format suits your preference in this article.",
    de:
      "Bei VELO Mini vs. Slim liegen die Hauptunterschiede in Größe, Stärke und Erlebnis. VELO-Mini-Beutel sind kleiner, diskreter und in niedrigeren Stärken erhältlich, während VELO Slim länger ist, mehr Stärkeoptionen bietet und länger hält. Erfahren Sie in diesem Artikel, welches Format zu Ihren Vorlieben passt.",
  },
  keyTakeaways: {
    title: { en: "Key takeaways", de: "Wichtigste Punkte" },
    items: {
      en: [
        "VELO mini vs slim pouches differ in size, nicotine delivery, and overall experience.",
        "VELO mini are smaller, more discreet pouches in lower strengths.",
        "VELO slim pouches are longer and have a wider range of nicotine strengths.",
        "VELO mini tends to contain 15 pouches, while slim has 20 pouches.",
      ],
      de: [
        "VELO Mini vs. Slim unterscheiden sich in Größe, Nikotinabgabe und Gesamterlebnis.",
        "VELO Mini sind kleinere, diskretere Beutel in niedrigeren Stärken.",
        "VELO-Slim-Beutel sind länger und bieten ein breiteres Spektrum an Nikotinstärken.",
        "VELO Mini enthält meist 15 Beutel, Slim in der Regel 20 Beutel.",
      ],
    },
  },
  toc: {
    title: { en: "Table of contents", de: "Inhaltsverzeichnis" },
    items: [
      {
        id: "glance",
        label: {
          en: "Key differences at a glance",
          de: "Die wichtigsten Unterschiede auf einen Blick",
        },
      },
      {
        id: "differences",
        label: {
          en: "Differences between VELO mini vs slim",
          de: "Unterschiede zwischen VELO Mini und Slim",
        },
      },
      {
        id: "size-shape",
        label: { en: "1. Size and shape", de: "1. Größe und Form" },
      },
      {
        id: "nicotine-strength",
        label: {
          en: "2. Nicotine content & strength",
          de: "2. Nikotingehalt und Stärke",
        },
      },
      {
        id: "experience",
        label: {
          en: "3. Nicotine & flavour experience",
          de: "3. Nikotin- und Geschmackserlebnis",
        },
      },
      {
        id: "preference",
        label: { en: "4. User preference", de: "4. Nutzerpräferenz" },
      },
      {
        id: "comfort",
        label: {
          en: "5. Portability & comfort",
          de: "5. Portabilität und Komfort",
        },
      },
      {
        id: "which-format",
        label: {
          en: "Which VELO pouch format should you choose?",
          de: "Welches VELO-Format passt zu Ihnen?",
        },
      },
      { id: "faqs", label: { en: "FAQs", de: "Häufige Fragen" } },
    ],
  },
  glanceIntro: {
    en: "When comparing VELO mini vs slim, the main differences are pouch size, nicotine strength, flavour duration, user preference, and comfort.",
    de:
      "Im Vergleich VELO Mini vs. Slim sind die Hauptunterschiede Beutelgröße, Nikotinstärke, Geschmacksdauer, persönliche Präferenz und Komfort.",
  },
  comparisonTable: {
    headers: {
      feature: { en: "Feature", de: "Merkmal" },
      mini: { en: "VELO Mini", de: "VELO Mini" },
      slim: { en: "VELO Slim", de: "VELO Slim" },
    },
    rows: [
      {
        feature: { en: "Pouch size", de: "Beutelgröße" },
        mini: { en: "Smaller", de: "Kleiner" },
        slim: { en: "Longer", de: "Länger" },
      },
      {
        feature: { en: "Nicotine strength", de: "Nikotinstärke" },
        mini: { en: "Lower nicotine strengths", de: "Niedrigere Stärken" },
        slim: {
          en: "Wider range of strengths",
          de: "Breiteres Stärkespektrum",
        },
      },
      {
        feature: {
          en: "Nicotine & flavour experience",
          de: "Nikotin- und Geschmackserlebnis",
        },
        mini: {
          en: "Faster nicotine release; shorter (perceived) flavour duration",
          de:
            "Schnellere Nikotinabgabe; kürzer wirkende Geschmacksdauer (subjektiv)",
        },
        slim: {
          en: "More gradual nicotine release; longer (perceived) flavour duration",
          de:
            "Sanftere Nikotinabgabe; länger wirkende Geschmacksdauer (subjektiv)",
        },
      },
      {
        feature: { en: "User preference", de: "Nutzerpräferenz" },
        mini: {
          en: "New users or those who prefer lower strengths and discretion",
          de:
            "Einsteiger oder Nutzer, die niedrigere Stärken und mehr Diskretion bevorzugen",
        },
        slim: {
          en: "Experienced users or those who prefer higher strengths",
          de:
            "Erfahrene Nutzer oder solche, die höhere Stärken bevorzugen",
        },
      },
      {
        feature: { en: "Comfort", de: "Komfort" },
        mini: {
          en: "Potentially more comfortable due to smaller size",
          de: "Möglicherweise angenehmer durch die kleinere Größe",
        },
        slim: {
          en: "Designed for comfort, but potentially more noticeable",
          de: "Komfortabel konstruiert, aber spürbar präsenter",
        },
      },
    ],
  },
  pouchCountNote: {
    en:
      "The number of pouches is also a key difference: VELO mini typically comes in 15 pouches, while VELO slim comes in 20 pouches.",
    de:
      "Auch die Beutelanzahl unterscheidet sich: VELO Mini enthält typischerweise 15 Beutel, VELO Slim in der Regel 20.",
  },
  sections: [
    {
      id: "size-shape",
      title: { en: "1. Size and shape", de: "1. Größe und Form" },
      paragraphs: {
        en: [
          "In the VELO slim vs mini comparison, size is one of the most noticeable differences.",
          'When you <a href="/{{LANG}}/snus-verkauf/velo">buy VELO mini snus</a>, the pouches are shorter, with a compact size that is designed to sit discreetly under the lip.',
          "VELO slim pouches are longer and flatter. While still discreet, they are slightly more noticeable compared to VELO mini.",
          'Some people search for <strong>VELO mini vs normal,</strong> but VELO does not offer nicotine pouches in a “normal” format—only slim and mini.',
        ],
        de: [
          "Im Vergleich VELO Slim vs. Mini ist die Größe einer der auffälligsten Unterschiede.",
          'Wenn Sie <a href="/{{LANG}}/snus-verkauf/velo">VELO Mini Snus kaufen</a>, sind die Beutel kürzer und kompakt – sie sollen diskret unter der Lippe liegen.',
          "VELO-Slim-Beutel sind länger und flacher. Sie bleiben diskret, wirken aber im Vergleich zu Mini etwas präsenter.",
          'Manche suchen nach <strong>„VELO Mini vs. Normal“</strong> – VELO bietet jedoch kein „Normal“-Format, sondern nur Slim und Mini.',
        ],
      },
    },
    {
      id: "nicotine-strength",
      title: {
        en: "2. Nicotine content & strength",
        de: "2. Nikotingehalt und Stärke",
      },
      paragraphs: {
        en: [
          "Another key difference in VELO mini vs slim is the available nicotine strength.",
          "VELO mini offers the lowest strengths in the range (nicotine content in mg per pouch): 4 mg and 6 mg.",
          "VELO slim offers a broader range of strengths: 6 mg, 8 mg, 10 mg, 10.9 mg, 14 mg, and 17 mg.",
          "In the VELO slim vs mini comparison, slim provides more options for those looking for higher nicotine strengths, while mini focuses on lower-strength formats.",
        ],
        de: [
          "Ein weiterer wichtiger Unterschied zwischen VELO Mini und Slim sind die verfügbaren Nikotinstärken.",
          "VELO Mini bietet die niedrigsten Stärken der Serie (Nikotin in mg pro Beutel): 4 mg und 6 mg.",
          "VELO Slim deckt ein breiteres Spektrum ab: 6 mg, 8 mg, 10 mg, 10,9 mg, 14 mg und 17 mg.",
          "Im Vergleich bietet Slim mehr Optionen für höhere Stärken, während Mini auf niedrigere Stärken ausgerichtet ist.",
        ],
      },
      cta: {
        label: {
          en: "Explore VELO nicotine strengths",
          de: "VELO Nikotinstärken entdecken",
        },
        linkKind: "strengthHub",
      },
    },
    {
      id: "experience",
      title: {
        en: "3. Nicotine & flavour experience",
        de: "3. Nikotin- und Geschmackserlebnis",
      },
      paragraphs: {
        en: [
          "For flavour duration and feel, VELO mini offers a faster, more concentrated nicotine release (due to compact size) and a slightly shorter perceived flavour duration.",
          "VELO slim offers a more gradual release (supported by a larger pouch surface area) and is often described as providing a longer-lasting flavour experience.",
        ],
        de: [
          "Bei Geschmack und Dauer liefert VELO Mini eine schnellere, konzentriertere Nikotinabgabe (durch das kompakte Format) und eine etwas kürzer empfundene Geschmacksdauer.",
          "VELO Slim wirkt oft gleichmäßiger (größere Oberfläche) und wird häufig als länger anhaltend im Geschmack beschrieben.",
        ],
      },
    },
    {
      id: "preference",
      title: { en: "4. User preference", de: "4. Nutzerpräferenz" },
      bullets: {
        titleMini: {
          en: "VELO mini tends to be preferred by:",
          de: "VELO Mini bevorzugen oft:",
        },
        mini: {
          en: ["New users", "Users who prefer lower strength options", "Users who prefer a more discreet format"],
          de: [
            "Einsteiger",
            "Nutzer mit Vorliebe für niedrigere Stärken",
            "Nutzer, die ein diskreteres Format schätzen",
          ],
        },
        titleSlim: {
          en: "VELO slim is typically preferred by:",
          de: "VELO Slim bevorzugen oft:",
        },
        slim: {
          en: [
            "Regular or experienced users",
            "Users who prefer higher nicotine strengths",
            "Users who prefer longer sessions",
          ],
          de: [
            "Regelmäßige oder erfahrene Nutzer",
            "Nutzer mit Vorliebe für höhere Nikotinstärken",
            "Nutzer, die längere Sessions bevorzugen",
          ],
        },
      },
    },
    {
      id: "comfort",
      title: {
        en: "5. Portability & comfort",
        de: "5. Portabilität und Komfort",
      },
      paragraphs: {
        en: [
          "VELO mini: the smaller pouch size may result in less pressure under the lip; some users find it more comfortable due to the reduced size.",
          "VELO slim: the slightly larger pouch can feel more present over extended use. It is designed for comfort, but is more noticeable than the mini format.",
        ],
        de: [
          "VELO Mini: Die kleinere Beutelgröße kann weniger Druck unter der Lippe bedeuten; viele empfinden sie durch die geringere Größe als angenehmer.",
          "VELO Slim: Der etwas größere Beutel kann bei längerer Nutzung stärker spürbar sein. Er ist komfortabel, aber gegenüber Mini präsenter.",
        ],
      },
    },
    {
      id: "which-format",
      title: {
        en: "Which VELO pouch format should you choose?",
        de: "Welches VELO-Format sollten Sie wählen?",
      },
      paragraphs: {
        en: [
          "Choosing between VELO mini vs slim depends on how you plan to use nicotine pouches and your preferred format.",
          "<strong>You may prefer VELO mini if</strong> you want a smaller, discreet pouch, prefer lower nicotine strengths, or use pouches regularly throughout the day.",
          "<strong>You may prefer VELO slim if</strong> you want a wider range of nicotine strengths, a longer-lasting experience, or are used to a slightly larger pouch format.",
          "For users comparing <strong>VELO mini vs normal,</strong> slim is generally considered the standard format with broader options.",
          'Both formats are available in a variety of flavours, including mint, fruit, and berry profiles—see <a href="/{{LANG}}/snus-verkauf/flavours">VELO flavour options</a> or choose by taste as well as format.',
        ],
        de: [
          "Die Wahl zwischen VELO Mini und Slim hängt von Ihrer Nutzung und Ihrem bevorzugten Format ab.",
          "<strong>VELO Mini kann passen, wenn</strong> Sie einen kleinen, diskreten Beutel mögen, niedrigere Stärken bevorzugen oder tagsüber regelmäßig nutzen.",
          "<strong>VELO Slim kann passen, wenn</strong> Sie mehr Stärkeoptionen, ein länger anhaltendes Erlebnis oder ein etwas größeres Format gewohnt sind.",
          'Wer <strong>„Mini vs. Normal“</strong> vergleicht: Slim gilt oft als Standardformat mit mehr Varianten.',
          'Beide Formate gibt es in vielen Geschmacksrichtungen – etwa Minze, Frucht und Beeren. <a href="/{{LANG}}/snus-verkauf/flavours">VELO Geschmacksoptionen</a> im Shop zeigen das Angebot—so können Sie nach Geschmack und Format wählen.',
        ],
      },
    },
  ],
  faqs: {
    title: { en: "FAQs: VELO mini vs slim", de: "FAQ: VELO Mini vs. Slim" },
    items: [
      {
        q: {
          en: "What's the difference between slim and mini VELO pouches?",
          de: "Was ist der Unterschied zwischen Slim- und Mini-VELO-Beuteln?",
        },
        a: {
          en:
            "Mini pouches are smaller and usually come in lower strengths (e.g. 4–6 mg) with fewer pouches per can (often 15). Slim pouches are longer, offer a wider strength range, and typically include 20 pouches per can.",
          de:
            "Mini-Beutel sind kleiner und meist in niedrigeren Stärken (z. B. 4–6 mg) mit weniger Beuteln pro Dose (oft 15). Slim-Beutel sind länger, bieten mehr Stärkevarianten und typischerweise 20 Beutel pro Dose.",
        },
      },
      {
        q: {
          en: "Are all flavours available in both slim and mini for VELO?",
          de: "Sind alle VELO-Geschmacksrichtungen in Slim und Mini erhältlich?",
        },
        a: {
          en:
            "Not every flavour is guaranteed in both formats; availability varies by market and product line. Check the VELO range in our shop for current options.",
          de:
            "Nicht jede Sorte gibt es garantiert in beiden Formaten; die Verfügbarkeit hängt von Markt und Sortiment ab. Aktuelle Optionen finden Sie in unserem Shop.",
        },
      },
      {
        q: {
          en: "Does the nicotine strength differ between VELO mini and slim?",
          de: "Unterscheidet sich die Nikotinstärke zwischen VELO Mini und Slim?",
        },
        a: {
          en:
            "Yes. Mini focuses on lower strengths (4 mg, 6 mg), while slim covers a broader range up to higher strengths such as 17 mg.",
          de:
            "Ja. Mini konzentriert sich auf niedrigere Stärken (4 mg, 6 mg), während Slim ein breiteres Spektrum bis zu höheren Stärken (z. B. 17 mg) abdeckt.",
        },
      },
      {
        q: {
          en: "Does flavour intensity differ between mini and slim?",
          de: "Unterscheidet sich die Geschmacksintensität zwischen Mini und Slim?",
        },
        a: {
          en:
            "Perceived flavour duration and intensity can differ because of pouch size and release profile—mini often feels more concentrated upfront; slim may feel smoother and longer-lasting to many users.",
          de:
            "Empfundene Intensität und Dauer können sich unterscheiden: Mini wirkt oft zu Beginn konzentrierter, Slim bei vielen Nutzern gleichmäßiger und länger anhaltend.",
        },
      },
    ],
  },
  /**
   * Related links: shop = main shop, brand = /snus-verkauf/:slug, blog = /blog/:slug
   */
  relatedArticles: [
    {
      title: {
        en: "Are nicotine pouches better than vaping?",
        de: "Sind Nikotinbeutel besser als Dampfen?",
      },
      excerpt: {
        en:
          "Pouches vs vapes: delivery, flavours, strength, social use, price—and how to choose.",
        de:
          "Beutel vs. Vape: Abgabe, Geschmack, Stärke, Alltag, Preis—und Entscheidungshilfe.",
      },
      to: { type: "blog", slug: "nicotine-pouches-vs-vapes" },
      image: relatedImgNicotineVsVape,
    },
    {
      title: {
        en: "Pablo nicotine pouches review",
        de: "Pablo Nikotinbeutel – Review",
      },
      excerpt: {
        en:
          "Flavour range, Gold range testing, panel scores, pros and cons—full Pablo review.",
        de:
          "Geschmacksangebot, Gold-Range-Test, Panel-Bewertungen, Vor- und Nachteile—das Pablo-Review.",
      },
      to: { type: "blog", slug: "pablo-nicotine-pouches-review" },
      image: relatedImgPablo,
    },
    {
      title: {
        en: "A beginner's guide to nicotine pouches",
        de: "Einsteiger-Guide: Nikotinbeutel",
      },
      excerpt: {
        en:
          "Strength, format, flavours, first week, and common mistakes—for existing nicotine users.",
        de:
          "Stärke, Format, Geschmack, erste Woche, typische Fehler—für bestehende Nikotinnutzer.",
      },
      to: { type: "blog", slug: "beginners-guide-nicotine-pouches" },
      image: relatedImgBeginner,
    },
  ],
};

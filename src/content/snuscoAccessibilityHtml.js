/** SnusCo — Accessibility statement (draft). */

export const ACCESSIBILITY_LAST_UPDATED = "2026-04-24";

export const ACCESSIBILITY_BODY_EN = `
<p>This statement describes how <strong>SnusCo</strong> approaches digital accessibility for <a href="https://www.snusco.at">www.snusco.at</a>. We aim to align with the <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.2 Level AA where reasonably achievable for our customers in Austria and beyond.</p>
<h2 id="toc">On this page</h2>
<ul>
<li><a href="#commitment">Our commitment</a></li>
<li><a href="#work">How we work on accessibility</a></li>
<li><a href="#improvements">Areas we are improving</a></li>
<li><a href="#feedback">Feedback</a></li>
</ul>

<h2 id="commitment">Our commitment to accessibility</h2>
<p>At SnusCo, we want shopping for nicotine pouches and related products to be as inclusive and usable as possible. Accessibility is part of how we think about product pages, checkout, and customer journeys—not an afterthought. Our goal is that people using assistive technologies, keyboard-only navigation, or different sensory needs can use our services in a straightforward way.</p>

<h2 id="work">Our accessibility work</h2>
<p>We work continuously to improve the experience for everyone who visits SnusCo. Accessibility is considered during design and development, and we combine automated checks with manual testing of critical flows (browse, product details, cart, and account where available).</p>
<p>We benchmark against WCAG 2.2 Level AA. We may also engage external specialists for audits or reviews when we ship larger changes. Meeting every success criterion on every legacy screen can take time; where gaps exist, we document them and prioritise fixes that affect real users most.</p>

<h2 id="improvements">Areas for improvement</h2>
<p>Like many growing shops, we know some parts of the site can be better. We are actively working on the following themes:</p>
<ul>
<li><strong>Semantic structure.</strong> Large catalogues and marketing content sometimes lack a fully consistent heading hierarchy (H1–H3). That can affect screen-reader navigation. We are rolling out clearer structure on key templates and cleaning up older pages over time, including language (<code>lang</code>) attributes where content is bilingual.</li>
<li><strong>Images and alternative text.</strong> Product imagery is central to our shop. Some decorative or legacy images may still miss optimal <code>alt</code> text. We are improving descriptions for meaningful images and marking decorative images appropriately.</li>
<li><strong>Video.</strong> Where we publish video, captions may not always be available yet. We plan to add captions or transcripts where the content is substantive.</li>
<li><strong>Keyboard navigation.</strong> Core navigation, search, and checkout are built with keyboard use in mind. Some complex widgets (for example certain filters or drawers) may still have focus traps or order issues—we treat those as bugs and fix them as we find them.</li>
<li><strong>Checkout and subscriptions.</strong> Some steps (including subscription options where offered) may not yet work optimally with every assistive technology combination. Please tell us if something blocks you; we prioritise checkout accessibility.</li>
</ul>

<h2 id="feedback">Feedback</h2>
<p>Your experience matters. If you run into an accessibility barrier on SnusCo, or have suggestions, please contact us—we read every message and use them to plan fixes.</p>
<p><strong>Customer service:</strong> <a href="mailto:support@snusco.at">support@snusco.at</a> · <a href="tel:+4312345678">+43 1 234 5678</a> (Mon–Fri 9:00–17:00 CET)</p>
<p><strong>Last updated:</strong> ${ACCESSIBILITY_LAST_UPDATED}.</p>
`;

export const ACCESSIBILITY_BODY_DE = `
<p>Diese Erklärung beschreibt, wie <strong>SnusCo</strong> digitale Barrierefreiheit für <a href="https://www.snusco.at">www.snusco.at</a> angeht. Wir orientieren uns an den <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.2 Konformitätsstufe AA, soweit für unseren Shop wirtschaftlich und technisch zumutbar.</p>
<h2 id="toc">Inhalt</h2>
<ul>
<li><a href="#commitment">Unser Bekenntnis</a></li>
<li><a href="#work">Wie wir arbeiten</a></li>
<li><a href="#improvements">Bereiche mit Verbesserungsbedarf</a></li>
<li><a href="#feedback">Rückmeldung</a></li>
</ul>

<h2 id="commitment">Unser Bekenntnis zur Barrierefreiheit</h2>
<p>Bei SnusCo möchten wir den Einkauf von Nikotinbeuteln und verwandten Produkten möglichst inklusiv und bedienbar gestalten. Barrierefreiheit fließt in Produktseiten, Checkout und Kundenwege ein. Unser Ziel ist, dass Menschen mit assistiven Technologien, rein per Tastatur oder mit unterschiedlichen sensorischen Anforderungen unsere Angebote möglichst reibungslos nutzen können.</p>

<h2 id="work">Unsere Arbeit an Barrierefreiheit</h2>
<p>Wir verbessern die Nutzungserfahrung fortlaufend. Barrierefreiheit wird in Konzeption und Entwicklung berücksichtigt; wir kombinieren automatisierte Prüfungen mit manuellen Tests zentraler Abläufe (Stöbern, Produktdetail, Warenkorb, Konto soweit vorhanden).</p>
<p>Als Orientierung dient WCAG 2.2 AA. Bei größeren Releases können externe Expert:innen prüfen. Nicht jeder ältere Bildschirm erfüllt bereits jedes Erfolgskriterium; bekannte Lücken priorisieren wir nach Nutzen für echte Nutzer:innen.</p>

<h2 id="improvements">Bereiche mit Verbesserungsbedarf</h2>
<p>Wir arbeiten unter anderem an:</p>
<ul>
<li><strong>Semantische Struktur.</strong> Große Kataloge und Marketinginhalte haben teils noch keine durchgängig logische Überschriftenhierarchie (H1–H3), was die Nutzung mit Screenreadern erschwert. Wir strukturieren zentrale Vorlagen nach und bereinigen ältere Inhalte, inkl. sinnvoller <code>lang</code>-Angaben.</li>
<li><strong>Bilder und Alternativtexte.</strong> Produktbilder sind zentral; bei älteren oder dekorativen Bildern fehlen mitunter optimale <code>alt</code>-Texte. Wir ergänzen beschreibende Texte und kennzeichnen reine Schmuckgrafiken.</li>
<li><strong>Video.</strong> Wo wir Videos einbinden, können Untertitel noch fehlen; bei inhaltlich relevantem Material planen wir Untertitel oder Transkripte.</li>
<li><strong>Tastaturbedienung.</strong> Kernnavigation, Suche und Checkout sind für Tastatur nutzbar ausgelegt. Komplexe Widgets (z. B. Filter, Drawers) können noch Fokus- oder Reihenfolgeprobleme haben—das behandeln wir als Bugs.</li>
<li><strong>Checkout und Abonnements.</strong> Einzelne Schritte (inkl. Abo-Optionen) sind mit nicht jeder assistiven Technologie optimal; bitte melden Sie Hindernisse, wir priorisieren Checkout-Barrierefreiheit.</li>
</ul>

<h2 id="feedback">Rückmeldung</h2>
<p>Wenn Sie auf SnusCo auf Barrieren stoßen oder Vorschläge haben, schreiben Sie uns—wir nutzen Ihr Feedback für die Planung von Verbesserungen.</p>
<p><strong>Kundenservice:</strong> <a href="mailto:support@snusco.at">support@snusco.at</a> · <a href="tel:+4312345678">+43 1 234 5678</a> (Mo–Fr 9:00–17:00 MEZ)</p>
<p><strong>Stand:</strong> ${ACCESSIBILITY_LAST_UPDATED}.</p>
`;

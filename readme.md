# priyam1498.github.io

Static multi-page site. No build step, no dependencies.

ALL FILENAMES ARE LOWERCASE. GitHub Pages is case-sensitive, so Index.html and
Styles.css will not answer requests for index.html and styles.css.

## Files to put in the repo root

    index.html          About: interests, background, education, recent news
    research.html       Two research threads, interactive explainer, earlier projects
    publications.html   All seven papers, filterable by topic
    cv.html             Skills, grants, talks, teaching, service, CV download
    styles.css          All styling. REPLACE the old file completely.
    site.js             Theme toggle, publication filters, explorer plot
    assets/favicon.svg

## Delete from the repo

    hobbies.html        Content moved into index.html

## assets/

    favicon.svg
    fig-metrology.png           In place: variational design loop
    fig-rl.png                  In place: two-layer network architecture
    CV_Priyam_Srivastava.pdf    STILL NEEDED, linked from index.html and cv.html
    og-card.png                 1200x630 link preview image, optional

Both figures are flattened onto white and shown full width inside a white plate,
since they are drawn on a light background and would otherwise glow against the
dark theme. Clicking one opens the full-resolution file.

To swap a figure later, replace the file in assets/ keeping the same name, and
update the alt text and caption in research.html.

## Editing

Navigation is repeated in the header of all four pages. To add a page, copy the
header block and add the link in all four, marking the current page with
class="on".

Colors live in the :root, [data-theme='dark'], and [data-theme='light'] blocks
at the top of styles.css. Teal marks the sensing thread, plum the networks
thread.

## Theme

Dark by default, toggle in the header, choice saved in localStorage, first-time
visitors get their system preference.

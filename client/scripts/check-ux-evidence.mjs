function sectionText(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start === -1) return "";
  const rest = markdown.slice(start + heading.length);
  const next = rest.search(/\n#{1,2}\s+/);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function checkboxLines(markdownSection) {
  return markdownSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^- \[[ xX]\]/.test(line));
}

function allChecked(items) {
  return items.every((line) => /^- \[[xX]\]/.test(line));
}

function isUiAffectingPath(path) {
  return (
    path.startsWith("client/src/") ||
    path.startsWith("client/public/") ||
    /\.(css|scss|sass|tsx|jsx)$/i.test(path)
  );
}

export function validateUxEvidence({ body, changedFiles }) {
  const uiTouched = (changedFiles || []).some((path) => isUiAffectingPath(path));
  if (!uiTouched) {
    return {
      ok: true,
      uiTouched: false,
      errors: [],
    };
  }

  const heading = "## UX / Navigation Review";
  const section = sectionText(body || "", heading);
  const boxes = checkboxLines(section);
  const errors = [];

  if (!(body || "").includes(heading)) {
    errors.push('UI/UX-affecting files changed; PR description must include a "## UX / Navigation Review" section.');
  }

  if (boxes.length === 0) {
    errors.push("UX / Navigation Review section must include checkbox evidence.");
  } else {
    if (!allChecked(boxes)) {
      errors.push("All UX / Navigation Review checkboxes must be checked for UI/UX-affecting changes.");
    }

    const authorityChecked = boxes.some((line) =>
      /^- \[[xX]\].*blecs-ux-authority.*(consulted|pass)/i.test(line),
    );
    if (!authorityChecked) {
      errors.push("UX / Navigation Review must include a checked blecs-ux-authority consultation result for UI/UX-affecting changes.");
    }

    const requirementGapChecked = boxes.some((line) =>
      /^- \[[xX]\].*(requirement[- ]?gap|gap disposition).*(blocking|non[- ]?blocking|resolved|deferred|none)/i.test(
        line,
      ),
    );
    if (!requirementGapChecked) {
      errors.push(
        "UX / Navigation Review must include a checked requirement-gap disposition line (blocking/non-blocking, resolved/deferred, or none).",
      );
    }
  }

  return {
    ok: errors.length === 0,
    uiTouched: true,
    errors,
  };
}

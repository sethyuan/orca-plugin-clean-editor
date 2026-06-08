import { setupL10N } from "./libs/l10n";
import zhCN from "./translations/zhCN";

let pluginName: string;
let observer: MutationObserver | null = null;

export async function load(_name: string) {
  pluginName = _name;

  setupL10N(orca.state.locale, { "zh-CN": zhCN });

  orca.themes.injectCSSResource(`${pluginName}/dist/styles.css`, pluginName);

  const mainEl = document.getElementById("main");
  if (!mainEl) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (!(addedNode instanceof Element)) continue;

        const containers = addedNode.classList?.contains(
          "orca-block-editor-query-tabs-container",
        )
          ? [addedNode]
          : [
              ...addedNode.querySelectorAll(
                ".orca-block-editor-query-tabs-container",
              ),
            ];

        for (const container of containers) {
          ensureHidebar(container);
        }
      }
    }
  });

  observer.observe(mainEl, { childList: true, subtree: true });

  // Initial pass: handle elements already in the DOM when plugin loads
  for (const container of mainEl.querySelectorAll(
    ".orca-block-editor-query-tabs-container",
  )) {
    ensureHidebar(container);
  }

  console.log(`${pluginName} loaded.`);
}

export async function unload() {
  // Clean up any resources used by the plugin here.
  observer?.disconnect();
  observer = null;
  orca.themes.removeCSSResources(pluginName);
}

function ensureHidebar(container: Element) {
  const prevSibling = container.previousElementSibling;
  if (prevSibling && prevSibling.classList.contains("kef-clean-editor-hidebar"))
    return;

  const hidebar = document.createElement("div");
  hidebar.className = "kef-clean-editor-hidebar kef-clean-editor-hide";
  container.parentNode?.insertBefore(hidebar, container);

  hidebar.addEventListener("click", () => {
    hidebar.classList.toggle("kef-clean-editor-hide");
  });
}

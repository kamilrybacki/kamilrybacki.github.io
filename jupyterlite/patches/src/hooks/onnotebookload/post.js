function waitForElementToExist(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

const mainPanelId = '#main-panel'
const topSpacerId = '#spacer-widget'
const topPanelId = '#top-panel-wrapper';
const menuPanelId = '#menu-panel-wrapper';
const notebookContentsClass = ".jp-Notebook"

const hideElement = async (selector) => {
  await waitForElementToExist(selector)
    .then((element) => {
      element.style.display = 'none';
    });
}

const applyBaseSiteTheme = (colors) => {
  const rootElement = document.querySelector(":root");
  rootElement.style.setProperty('--jp-layout-color2', colors.background);
  rootElement.style.setProperty('--jp-layout-color0', colors.background);
  rootElement.style.setProperty('--jp-toolbar-background', colors.background);
  rootElement.style.setProperty('--jp-ui-font-color1', colors.foreground);
  rootElement.style.setProperty('--jp-content-font-color0', colors.foreground);
  rootElement.style.setProperty('--jp-content-font-color1', colors.foreground);
}

async function post () {
  await hideElement(topPanelId);
  await hideElement(menuPanelId);
  await waitForElementToExist(mainPanelId)
    .then((panel) => panel.style.setProperty('top', '0px'));
  await waitForElementToExist(topSpacerId)
    .then((panel) => panel.style.setProperty('top', '0px'));
  await waitForElementToExist(notebookContentsClass)
    .then(() => import('./theme.js'))
    .then((m) => m.theme)
    .then(({ colors }) => applyBaseSiteTheme(colors));
  console.log('Finished post script');
};

export default post;

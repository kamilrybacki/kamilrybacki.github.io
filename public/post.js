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

const topPanelId = '#top-panel-wrapper';
const menuPanelId = '#menu-panel-wrapper';
const notebookContentsClass = '.jp-Notebook'

const hideElement = async (selector) => {
  return await waitForElementToExist(selector)
    .then((element) => {
      element.style.display = 'none';
      return element;
    });
}

async function post () {
  await hideElement(topPanelId);
  await hideElement(menuPanelId);
  await waitForElementToExist(notebookContentsClass)
    .then(() => {
      const r = document.querySelector(':root');
      r.style.setProperty("--jp-layout-color2", "black");
      r.style.setProperty("--jp-toolbar-background", "black");
      r.style.setProperty("--jp-content-font-color1", "white")
    })
  console.log('Finished post script');
};

export default post;

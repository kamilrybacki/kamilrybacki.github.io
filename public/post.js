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

const hideElement = async (selector) => {
  await waitForElementToExist(selector)
    .then((element) => {
      element.style.display = 'none';
    });
}

async function post () {
  await hideElement(topPanelId);
  await hideElement(menuPanelId);
  console.log('Finished post script');
};

export default post;

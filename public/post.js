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

const notebookToolbarClass = '.jp-NotebookPanel-toolbar';

const menuItemsToHide = [
  'notebook:insert-cell-below',
  'notebook:cut-cell',
  'notebook:paste-cell-below',
  'notebook:copy-cell',
  'docmanager:save'
];

const hideElement = (selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.style.display = 'none';
  }
}

async function post () {
  waitForElementToExist(topPanelId).then(() => {
    [topPanelId, menuPanelId]
      .forEach((id) => hideElement(id));
  });
  waitForElementToExist(notebookToolbarClass).then((toolbar) => {
    const commandButtons = toolbar.getElementsByClassName('jp-CommandToolbarButton');
    waitForElementToExist('.jp-Button').then(() => {
      [...commandButtons].forEach((button) => {
        const buttonElement = button.querySelector('.jp-Button');
        const command = buttonElement.getAttribute('data-command');
        if (menuItemsToHide.includes(command)) {
          console.log(`Hiding ${command}`)
          button.style.display = 'none';
        }
      })
    });
    ['jp-Notebook-toolbarCellType', 'jp-KernelName'].forEach((className) => {
      waitForElementToExist(className).then((element) => {
        element.style.display = 'none';
      });
    });
  });
  console.log('Finished post script');
};

export default post;

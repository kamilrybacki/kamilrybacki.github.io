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
const commandButtonClass = '.jp-CommandToolbarButton';
const cellTypeDropdownClass = '.jp-Notebook-toolbarCellType';
const kernelSelectorClass = '.jp-KernelName';

const menuItemsToHide = [
  'notebook:insert-cell-below',
  'notebook:cut-cell',
  'notebook:paste-cell-below',
  'notebook:copy-cell',
  'docmanager:save'
];

const hideElement = async (selector) => {
  await waitForElementToExist(selector)
    .then((element) => {
      element.style.display = 'none';
    });
}

async function post () {
  await hideElement(topPanelId);
  await hideElement(menuPanelId);
  // await waitForElementToExist(notebookToolbarClass)
  //   .then((toolbar) => {
  //     const commandButtons = toolbar.getElementsByClassName(commandButtonClass.slice(1));
  //     [...commandButtons].forEach((button) => {
  //       const command = button.firstChild.getAttribute('data-command');
  //       if (menuItemsToHide.includes(command)) {
  //         console.log(`Disabling command: ${command}`);
  //         hideElement(`[data-command="${command}"]`);
  //       }
  //     });
  //   });
  // await hideElement(cellTypeDropdownClass);
  // await hideElement(kernelSelectorClass);

  console.log('Finished post script');
};

export default post;
